import Handsontable from "handsontable";

function wrappingRenderer(
        instance: any, td: HTMLElement, row: any, col: any, prop: any, value: any, cellProperties: any) {
    const escaped = Handsontable.helper.stringify(value);
    const cellWrapperDiv = document.createElement("div");
    cellWrapperDiv.className = "cell-wrapper";

    const cellWrapperPre = document.createElement("pre");
    cellWrapperPre.innerText = escaped;
    cellWrapperDiv.appendChild(cellWrapperPre);

    td.innerHTML = "";
    td.appendChild(cellWrapperDiv);

    return td;
}

export default wrappingRenderer;
