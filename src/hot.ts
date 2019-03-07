import Handsontable from "handsontable";
import showdown from "showdown";

const mdConverter = new showdown.Converter();

const mdMarkerRegex = /^@md\W/;
const mdMarkerFullLineRegex = /^@md[^\n]*\n/;

function wrappingRenderer(
        instance: any, td: HTMLElement, row: any, col: any, prop: any, value: any, cellProperties: any) {
    const escaped = Handsontable.helper.stringify(value);
    const cellWrapperDiv = document.createElement("div");
    cellWrapperDiv.className = "cell-wrapper";

    if (mdMarkerRegex.test(escaped)) {
        cellWrapperDiv.innerHTML = mdConverter.makeHtml(escaped.replace(mdMarkerFullLineRegex, ""));
    } else {
        const cellWrapperPre = document.createElement("pre");
        cellWrapperPre.innerText = escaped;
        cellWrapperDiv.appendChild(cellWrapperPre);
    }

    td.innerHTML = "";
    td.appendChild(cellWrapperDiv);

    return td;
}

export default wrappingRenderer;
