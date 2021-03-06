import BaseComponent from './BaseComponent';
import SetValueCommand from '../command/SetValueCommand';
import RemoveObjectCommand from '../command/RemoveObjectCommand';
import AddObjectCommand from '../command/AddObjectCommand';
// import MMDWindow from '../editor/window/MMDWindow';

/**
 * MMD模型组件
 * @author tengge / https://github.com/tengge1
 * @param {*} options 
 */
function MMDComponent(options) {
    BaseComponent.call(this, options);
    this.selected = null;
}

MMDComponent.prototype = Object.create(BaseComponent.prototype);
MMDComponent.prototype.constructor = MMDComponent;

MMDComponent.prototype.render = function () {
    var data = {
        xtype: 'div',
        id: 'mmdPanel',
        scope: this.id,
        parent: this.parent,
        cls: 'Panel',
        style: {
            display: 'none'
        },
        children: [{
            xtype: 'row',
            children: [{
                xtype: 'label',
                style: {
                    width: '100%',
                    color: '#555',
                    fontWeight: 'bold'
                },
                text: 'MMD模型'
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '模型动画'
            }, {
                xtype: 'input',
                id: 'animation',
                scope: this.id,
                disabled: true,
                style: {
                    width: '80px',
                    fontSize: '12px'
                }
            }, {
                xtype: 'button',
                text: '选择',
                onClick: this.selectAnimation.bind(this)
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '相机动画'
            }, {
                xtype: 'input',
                id: 'cameraAnimation',
                scope: this.id,
                disabled: true,
                style: {
                    width: '80px',
                    fontSize: '12px'
                }
            }, {
                xtype: 'button',
                text: '选择',
                onClick: this.selectCameraAnimation.bind(this)
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '音频'
            }, {
                xtype: 'input',
                id: 'audio',
                scope: this.id,
                disabled: true,
                style: {
                    width: '80px',
                    fontSize: '12px'
                }
            }, {
                xtype: 'button',
                text: '选择',
                onClick: this.selectAudio.bind(this)
            }]
        }]
    };

    var control = UI.create(data);
    control.render();

    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
};

MMDComponent.prototype.onObjectSelected = function () {
    this.updateUI();
};

MMDComponent.prototype.onObjectChanged = function () {
    this.updateUI();
};

MMDComponent.prototype.updateUI = function () {
    var container = UI.get('mmdPanel', this.id);
    var editor = this.app.editor;
    if (editor.selected && (editor.selected.userData.Type === 'pmd' || editor.selected.userData.Type === 'pmx')) {
        container.dom.style.display = '';
    } else {
        container.dom.style.display = 'none';
        return;
    }

    this.selected = editor.selected;

    var animation = UI.get('animation', this.id);
    var cameraAnimation = UI.get('cameraAnimation', this.id);
    var audio = UI.get('audio', this.id);

    if (this.selected.userData.Animation) {
        animation.setValue(this.selected.userData.Animation.Name);
    } else {
        animation.setValue('');
    }

    if (this.selected.userData.CameraAnimation) {
        cameraAnimation.setValue(this.selected.userData.CameraAnimation.Name);
    } else {
        cameraAnimation.setValue('');
    }

    if (this.selected.userData.Audio) {
        audio.setValue(this.selected.userData.Audio.Name);
    } else {
        audio.setValue('');
    }
};

// ----------------------------- 模型动画 ------------------------------------------

MMDComponent.prototype.selectAnimation = function () {
    this.app.call(`selectBottomPanel`, this, 'animation');
    UI.msg('请点击动画面板中的动画！');
    this.app.on(`selectAnimation.${this.id}`, this.onSelectAnimation.bind(this));
};

MMDComponent.prototype.onSelectAnimation = function (data) {
    if (data.Type !== 'mmd') {
        UI.msg(`只允许选择MMD模型动画！`);
        return;
    }
    this.app.on(`selectAnimation.${this.id}`, null);

    this.selected.userData.Animation = {};
    Object.assign(this.selected.userData.Animation, data);
    this.updateUI();
};

// ---------------------------- 相机动画 -------------------------------------------

MMDComponent.prototype.selectCameraAnimation = function () {
    this.app.call(`selectBottomPanel`, this, 'animation');
    UI.msg('请点击动画面板中的相机动画！');
    this.app.on(`selectAnimation.${this.id}`, this.onSelectCameraAnimation.bind(this));
};

MMDComponent.prototype.onSelectCameraAnimation = function (data) {
    if (data.Type !== 'mmd') {
        UI.msg(`只允许选择MMD相机动画！`);
        return;
    }
    this.app.on(`selectAnimation.${this.id}`, null);

    this.selected.userData.CameraAnimation = {};
    Object.assign(this.selected.userData.CameraAnimation, data);
    this.updateUI();
};

// ------------------------------ MMD音乐 --------------------------------------------

MMDComponent.prototype.selectAudio = function () {
    this.app.call(`selectBottomPanel`, this, 'audio');
    UI.msg('请点击MMD动画对应的音频！');
    this.app.on(`selectAudio.${this.id}`, this.onSelectAudio.bind(this));
};

MMDComponent.prototype.onSelectAudio = function (data) {
    this.app.on(`selectAudio.${this.id}`, null);

    this.selected.userData.Audio = {};
    Object.assign(this.selected.userData.Audio, data);
    this.updateUI();
};

export default MMDComponent;