import helpers from '../../helpers';

class ScriptsRenderer{
	constructor({container}){
		this.container = container;

    this.container.appendChild(helpers.createTitle({text: 'Scripts :'}));

		this.scriptTotag = new WeakMap();
		this.tagToScript = new WeakMap();

		this.ul = document.createElement('ul');
		this.container.appendChild(this.ul);
	}

	getSelectedScripts(){
		return Array.from(this.ul.querySelectorAll('input'))
			.filter((input)=>{
				return input.checked;
			}).map((input)=>{
				return this.tagToScript.get(input);
			});
	}

  addScript({script}){
    let liCheckBox = ScriptsRenderer.createCheckBox({text: script.text});
    let input = liCheckBox.querySelector('input');
    if(script.type === 'embded'){
      let editButton = document.createElement('button');
      editButton.innerText = 'edit';
      editButton.onclick = ()=>{
        helpers.editScript(script);
      };
      liCheckBox.appendChild(editButton);
    }
    this.scriptTotag.set(script, input);
    this.tagToScript.set(input, script);
    this.ul.appendChild(liCheckBox);
  }

  removeScript({script}){
    let tag = this.scriptTotag.get(script);
    this.tagToScript.delete(tag);
    this.scriptTotag.delete(script);
    let li = tag.parentElement
    li.parentElement.removeChild(li);
  }

	render({scripts}){
		this.ul.innerHTML = "";

		scripts.forEach((script)=>{
      this.addScript({script});
		});
	}

	clearHlighting({level}){
		[... this.ul.childNodes].forEach((li)=>{
			if(level){
				li.classList.remove('highligh'+level);
			}else{
				li.classList.remove('highligh');
				li.classList.remove('highligh1');
				li.classList.remove('highligh2');
			}
		});
	}

	highlightScripts({scripts, level = ''}){
		this.clearHlighting({level});
		scripts.forEach((script)=>{
			let tag = this.scriptTotag.get(script).parentElement;
			let highlited = tag.classList.contains('highligh');
			if(!level || !highlited){
				tag.classList.add('highligh'+level);
			}
		});
	}

	static createCheckBox({text}){
		// http://stackoverflow.com/questions/866239/creating-the-checkbox-dynamically-using-javascript
		let li = document.createElement('li');
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		var label = document.createElement('label')
		label.htmlFor = "id";
		label.appendChild(document.createTextNode(text));

		li.appendChild(checkbox);
		li.appendChild(label);

		return li;
	}
}

export default ScriptsRenderer;
