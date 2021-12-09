import AbstractView from "./AbstractView.js";


export default class extends AbstractView {
    constructor(){
        super();
        this.setTitle("ExR Viewer");
    }

    async getHtml(){
        return `
            <div class="exr-container">
                <div class="exr-head">
                    <p class="exr-header">Rates </p>
                    <span id="exr-currency"></span>
                </div>

                <ul class="exr-rates">
                    <p>Loading...</p>
                </ul>
            </div>
        `;
    }
}