import AbstractView from "./AbstractView.js";


export default class extends AbstractView {
    constructor(){
        super();
        this.setTitle("ExR Calculator");
    }

    async getHtml(){
        return `
            <div class="exr-container">
                <div class="exr-head">
                    <p class="exr-header">Calculator</p>
                </div>

                <div class="exr-calculator">
                    <select id="calc-select-one" class="select-rate">
                        <option>Loading...</option>
                    </select>
                    <input type="number" id="calculate-one" class="calculation-input" name="calculate-one" min="0" step="0.01" placeholder="0">

                    <select id="calc-select-two" class="select-rate">
                        <option>Loading...</option>
                    </select>
                    
                    <span id="calculated_value">0</span>
                </div>

            </div>
        `;
    }
}