import {me} from 'melonjs';

/**
 * input name
 */
export default class Textinput extends me.Renderable {

    init(x, y, settings) {

        this._super(me.Renderable, 'init', [x, y, 0, 0]);

        this.input = document.createElement("INPUT");
        this.input.setAttribute("type", settings.type);

        for (let attr in settings) {
            this.input.setAttribute(attr, settings[attr]);
        }

        try {
            document.getElementById(settings.id).remove();
        } catch (e) {
            
        }
        
        document.getElementById("wrapper").appendChild(this.input);

    }

    destroy() {
        this.input.remove();
    }
}

