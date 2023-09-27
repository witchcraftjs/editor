// we can't do this, it's terrible on mobile
// todo create fake selection
// const posInfo = props.editor.view.posAtCoords({
// 	left: pointerCoords.value.x,
// 	top:pointerCoords.value.y,
// })
// const wantedPos = posInfo?.pos
// const $pos = props.editor.state.doc.resolve(props.getPos()+1)
// // check is not inside self
// if (wantedPos && (wantedPos < $pos.start() || wantedPos > $pos.end())) {
//
// 	props.editor.chain()
// 		.focus()
// 		.setTextSelection({ from: wantedPos, to: wantedPos })
// 	.run()
// }
