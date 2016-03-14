let helpers = {
  createTitle({text, h = 'h3'}){
		let title = document.createElement(h);
		title.innerText = text;
		return title;
	},
  createInputWithLabel({ labelContent, content, id, withLi }) {
		id = id || (labelContent + '-id');

		let label = document.createElement('label');
		label.setAttribute('for', id);
		label.textContent = labelContent;

		let input = document.createElement('input');
		input.setAttribute('id', id);
		input.setAttribute('id', 'text');

		if (content) {
			input.value = content;
		}

		label.appendChild(input);

		let li;
		if (withLi) {
			li = document.createElement('li');
			li.appendChild(label);
		}

		return {
			label, input, li
		};
	},

};

export default helpers;
