import UI from '../../ui/UI';
import Ajax from '../../utils/Ajax';
import EditWindow from '../window/EditWindow';
import ModelLoader from '../../loader/ModelLoader';
import AddObjectCommand from '../../command/AddObjectCommand';
import UploadUtils from '../../utils/UploadUtils';

/**
 * 模型面板
 * @author tengge / https://github.com/tengge1
 */
function ModelPanel(options) {
    UI.Control.call(this, options);
    this.app = options.app;

    this.firstShow = true;

    this.data = [];
};

ModelPanel.prototype = Object.create(UI.Control.prototype);
ModelPanel.prototype.constructor = ModelPanel;

ModelPanel.prototype.render = function () {
    this.app.on(`showBottomPanel.${this.id}`, this.onShowPanel.bind(this));
};

ModelPanel.prototype.onShowPanel = function (tabName) {
    if (tabName !== 'model') {
        return;
    }

    if (this.firstShow) {
        this.firstShow = false;
        this.renderUI();
    }

    this.update();
};

ModelPanel.prototype.renderUI = function () {
    var control = UI.create({
        xtype: 'div',
        parent: this.parent,
        style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
        },
        children: [{
            xtype: 'div',
            style: {
                width: '200px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                borderRight: '1px solid #ddd',
            },
            children: [{
                xtype: 'div',
                style: {
                    display: 'flex'
                },
                children: [{
                    xtype: 'iconbutton',
                    icon: 'icon-upload',
                    title: '上传',
                    style: {
                        padding: '2px'
                    },
                    onClick: this.onUpload.bind(this)
                }, {
                    xtype: 'searchfield',
                    id: 'search',
                    scope: this.id,
                    showSearchButton: false,
                    showResetButton: true,
                    onInput: this.onSearch.bind(this)
                }]
            }, {
                xtype: 'div',
                style: {
                    height: 'calc(100% - 30px)'
                },
                children: [{
                    xtype: 'category',
                    id: 'category',
                    scope: this.id,
                    onChange: this.onSearch.bind(this)
                }]
            }]
        }, {
            xtype: 'div',
            style: {
                width: '100%',
                height: '100%',
                flex: 1,
                overflow: 'auto'
            },
            children: [{
                xtype: 'imagelist',
                id: 'images',
                scope: this.id,
                style: {
                    width: '100%',
                    maxHeight: '100%',
                },
                onClick: this.onClick.bind(this)
            }]
        }]
    });

    control.render();
};

ModelPanel.prototype.update = function () {
    this.updateCategory();
    this.updateList();
};

ModelPanel.prototype.updateCategory = function () {
    var category = UI.get('category', this.id);
    category.clear();

    Ajax.getJson(`/api/Category/List?type=Mesh`, obj => {
        category.options = {};
        obj.Data.forEach(n => {
            category.options[n.ID] = n.Name;
        });
        category.render();
    });
};

ModelPanel.prototype.updateList = function () {
    var search = UI.get('search', this.id);

    Ajax.getJson(`/api/Mesh/List`, obj => {
        this.data = obj.Data;
        search.setValue('');
        this.onSearch();
    });
};

ModelPanel.prototype.onSearch = function () {
    var search = UI.get('search', this.id);
    var category = UI.get('category', this.id);

    var name = search.getValue();
    var categories = category.getValue();

    var list = this.data;

    if (name.trim() !== '') {
        name = name.toLowerCase();

        list = list.filter(n => {
            return n.Name.indexOf(name) > -1 ||
                n.FirstPinYin.indexOf(name) > -1 ||
                n.TotalPinYin.indexOf(name) > -1;
        });
    }

    if (categories.length > 0) {
        list = list.filter(n => {
            return categories.indexOf(n.CategoryID) > -1;
        });
    }

    this.renderList(list);
};

ModelPanel.prototype.renderList = function (list) {
    var images = UI.get('images', this.id);
    images.clear();

    images.children = list.map(n => {
        return {
            xtype: 'image',
            src: n.Thumbnail ? n.Thumbnail : null,
            title: n.Name,
            data: n,
            icon: 'icon-model',
            cornerText: n.Type,
            style: {
                backgroundColor: '#eee'
            }
        };
    });;

    images.render();
};

ModelPanel.prototype.onClick = function (event, index, btn, control) {
    var data = control.children[index].data;

    if (btn === 'edit') {
        if (typeof (this.onEdit) === 'function') {
            this.onEdit(data);
        }
    } else if (btn === 'delete') {
        if (typeof (this.onDelete) === 'function') {
            this.onDelete(data);
        }
    } else {
        if (typeof (this.onClick) === 'function') {
            this.onAddMesh(data);
        }
    }
};

// ------------------------------------- 添加 ------------------------------------

ModelPanel.prototype.onAddMesh = function (model) {
    var loader = new ModelLoader(this.app);

    var url = model.Url;

    if (model.Url.indexOf(';') > -1) { // 包含多个入口文件
        url = url.split(';').map(n => this.app.options.server + n);
    } else {
        url = this.app.options.server + model.Url;
    }

    loader.load(url, model, {
        camera: this.app.editor.camera,
        renderer: this.app.editor.renderer,
        audioListener: this.app.editor.audioListener
    }).then(obj => {
        if (!obj) {
            return;
        }
        obj.name = model.Name;

        Object.assign(obj.userData, model, {
            Server: true
        });

        var cmd = new AddObjectCommand(obj);
        cmd.execute();

        if (obj.userData.scripts) {
            obj.userData.scripts.forEach(n => {
                this.app.editor.scripts[n.uuid] = n;
            });
            this.app.call('scriptChanged', this);
        }
    });
};

// ----------------------------------- 上传 ----------------------------------------

ModelPanel.prototype.onUpload = function () {
    if (this.input === undefined) {
        this.input = document.createElement('input');
        this.input.id = `file_${this.id}`;
        this.input.type = 'file';
        this.input.style.display = 'none';
        this.input.addEventListener('change', this.onCommitUpload.bind(this));
        document.body.appendChild(this.input);
    }

    this.input.value = null;
    this.input.click();
};

ModelPanel.prototype.onCommitUpload = function () {
    UploadUtils.upload(`file_${this.id}`, `/api/Mesh/Add`, event => {
        if (event.target.status === 200) {
            var response = event.target.response;
            var obj = JSON.parse(response);
            UI.msg(obj.Msg);
            if (obj.Code === 200) {
                this.updateList();
            }
        } else {
            UI.msg('上传失败！');
        }
    }, () => {
        UI.msg('上传失败！');
    });
};

// ------------------------------- 编辑 ---------------------------------------

ModelPanel.prototype.onEdit = function (data) {
    if (this.editWindow === undefined) {
        this.editWindow = new EditWindow({
            app: this.app,
            parent: document.body,
            type: 'Mesh',
            typeName: '模型',
            saveUrl: `${this.app.options.server}/api/Mesh/Edit`,
            callback: this.update.bind(this)
        });
        this.editWindow.render();
    }
    this.editWindow.setData(data);
    this.editWindow.show();
};

// -------------------------------- 删除 ----------------------------------------

ModelPanel.prototype.onDelete = function (data) {
    UI.confirm('询问', `是否删除${data.Name}？`, (event, btn) => {
        if (btn === 'ok') {
            Ajax.post(`/api/Mesh/Delete?ID=${data.ID}`, json => {
                var obj = JSON.parse(json);
                if (obj.Code === 200) {
                    this.update();
                }
                UI.msg(obj.Msg);
            });
        }
    });
};

export default ModelPanel;