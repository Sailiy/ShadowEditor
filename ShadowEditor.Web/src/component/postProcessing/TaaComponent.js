import BaseComponent from '../BaseComponent';

/**
 * 时间抗锯齿(TAA)组件
 * @author tengge / https://github.com/tengge1
 * @param {*} options 
 */
function TaaComponent(options) {
    BaseComponent.call(this, options);
    this.selected = null;
}

TaaComponent.prototype = Object.create(BaseComponent.prototype);
TaaComponent.prototype.constructor = TaaComponent;

TaaComponent.prototype.render = function () {
    var data = {
        xtype: 'div',
        id: 'panel',
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
                    color: '#555',
                    fontWeight: 'bold',
                    width: '100%'
                },
                text: '时间抗锯齿(TAA)'
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '启用状态'
            }, {
                xtype: 'checkbox',
                id: 'enabled',
                scope: this.id,
                value: false,
                onChange: this.onChange.bind(this)
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '等级'
            }, {
                xtype: 'select',
                id: 'sampleLevel',
                scope: this.id,
                options: {
                    0: '1个样本',
                    1: '2个样本',
                    2: '4个样本',
                    3: '8个样本',
                    4: '16个样本',
                    5: '32个样本'
                },
                value: '3',
                onChange: this.onChange.bind(this)
            }]
        }, {
            xtype: 'row',
            children: [{
                xtype: 'label',
                text: '无偏差'
            }, {
                xtype: 'checkbox',
                id: 'unbiased',
                scope: this.id,
                value: true,
                onChange: this.onChange.bind(this)
            }]
        }]
    };

    var control = UI.create(data);
    control.render();

    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
};

TaaComponent.prototype.onObjectSelected = function () {
    this.updateUI();
};

TaaComponent.prototype.onObjectChanged = function () {
    this.updateUI();
};

TaaComponent.prototype.updateUI = function () {
    var container = UI.get('panel', this.id);
    var editor = this.app.editor;
    if (editor.selected && editor.selected instanceof THREE.Scene) {
        container.dom.style.display = '';
    } else {
        container.dom.style.display = 'none';
        return;
    }

    this.selected = editor.selected;

    var enabled = UI.get('enabled', this.id);
    var sampleLevel = UI.get('sampleLevel', this.id);
    var unbiased = UI.get('unbiased', this.id);

    var scene = this.selected;
    var postProcessing = scene.userData.postProcessing || {};

    if (postProcessing.taa) {
        enabled.setValue(postProcessing.taa.enabled);
        sampleLevel.setValue(postProcessing.taa.sampleLevel);
        unbiased.setValue(postProcessing.taa.unbiased);
    }
};

TaaComponent.prototype.onChange = function () {
    var enabled = UI.get('enabled', this.id);
    var sampleLevel = UI.get('sampleLevel', this.id);
    var unbiased = UI.get('unbiased', this.id);

    var scene = this.selected;
    scene.userData.postProcessing = scene.userData.postProcessing || {};

    Object.assign(scene.userData.postProcessing, {
        taa: {
            enabled: enabled.getValue(),
            sampleLevel: parseInt(sampleLevel.getValue()),
            unbiased: unbiased.getValue(),
        },
    });

    this.app.call(`postProcessingChanged`, this);
};

export default TaaComponent;