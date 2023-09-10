// this is just to get syntax highlighting, crop won't affect the output
import { crop as html } from "@alanscodelog/utils/crop"

export const someDoc = {
	title: "Some Doc",
	content: html`
		<li blockid="some-sub-id"><p>A</p></li>
		<li blockid="some-sub-id2"><p>B</p></li>
	`,
	embedder: html`
		<li><div type="embeddedDoc" embeddocid="someDoc"></div></li>
	`,
	subEmbedders: [
		html` <li><div type="embeddedDoc" embeddocid="someDoc" embedblockid="some-sub-id"></div></li> `,
		html` <li><div type="embeddedDoc" embeddocid="someDoc" embedblockid="some-sub-id2"></div></li> `
	]
}

export const someDoc2 = {
	title: "Some Doc 2",
	content: html`
		<li blockid="some-sub-id"><p>C</p></li>
	`,
	embedder: html`
		<li><div type="embeddedDoc" embeddocid="someDoc2"></div></li>
	`,
	subEmbedders: [html`
		<li><div type="embeddedDoc" embeddocid="someDoc2" embedblockid="some-sub-id"></div></li>
	`]
}

export const someDoc3 = {
	title: "Some Doc 3",
	content: html`
		<li blockid="some-sub-id"><p>D</p></li>
		<li blockid="some-sub-id2"><p>E</p></li>
	`,
	embedder: html`
		<li><div type="embeddedDoc" embeddocid="someDoc3"></div></li>
	`,
	subEmbedders: [
		html` <li><div type="embeddedDoc" embeddocid="someDoc3" embedblockid="some-sub-id"></div></li> `,
		html` <li><div type="embeddedDoc" embeddocid="someDoc3" embedblockid="some-sub-id2"></div></li> `
	]
}

export const contentSimpleTable = html`
<li>
	<table>
		<thead>
			<th>a</th>
			<th>b</th>
		</thead>
		<tbody>
		<tr>
			<td>a2</td>
			<td>b2</td>
		</tr>
		<tr>
			<td>a3</td>
			<td>b3</td>
		</tr>
		</tbody>
	</table>
</li>
`

export const contentParagraphs = html`
<li><p>Paragraph</p></li>
<li><p>Paragraph with<br/> line break.</p></li>
`
export const contentMarks = html`
<li><p><mark data-color="yellow">Yellow</mark></p></li>
<li><p><mark data-color="orange">Orange</mark></p></li>
<li><p><mark data-color="red">Red</mark></p></li>
<li><p><mark data-color="green">Green</mark></p></li>
<li><p><mark data-color="blue">Blue</mark></p></li>
<li><b>Bold</b></li>
<li><i>Italic</i></li>
<li><s>Strikethrough</s></li>
<li><u>Underline</u></li>
<li><sub>Subscript</sub></li>
<li><sup>Superscript</sup></li>
<li><code>Inline Code</code></li>
<li><b> Bold <i> Italic <a href="https://www.google.com">Link</a></i></b></li>
<li><b> Bold <i> Italic <a href="internal://some-id">Internal Link</a></i></b></li>
`

export const contentBlockTypes = html`
<li><pre><code language="css">.code .block {
	color: red;
}</code></pre></li>
<li><blockquote><p>Blockquote</p></blockquote></li>
<li><h1>Heading 1</h1></li>
<li><h2>Heading 2</h2></li>
<li><h3>Heading 3</h3></li>
<li><h4>Heading 4</h4></li>
<li><h5>Heading 5</h5></li>
<li><h6>Heading 6</h6></li>
<li><p>Image</p></li>
<!-- is removed-->
<li><div type="fileLoader" file-name="some-file.png" file-loading="true" file-loading-id="some-id"></div> </li>
<li><img src="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC"/></li>
${contentSimpleTable}
${someDoc.embedder}
${someDoc.subEmbedders[0]}
`
export const contentAllNodeTypes = html`
${contentParagraphs}
${contentMarks}
${contentBlockTypes}
`
export const root = {
	title: "Root",
	embedder: html`
		<li><div embeddocid="root"></div></li>
	`,
	content: html`
	<ul>
		${contentAllNodeTypes}
	<ul>
`
}

export const testDocuments = {
	root,
	someDoc,
	someDoc2,
	someDoc3
}
