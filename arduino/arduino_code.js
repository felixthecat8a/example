window.addEventListener('load', () => {
    const codeElements = document.querySelectorAll('code.language-arduino');
    codeElements.forEach((codeElement) => {
        const code = codeElement.textContent;
        const keywordRegex = /\b(void|const|int|bool|class|private|public)\b/g;
        const constantsRegex = /\b(LOW|HIGH|OUTPUT|INPUT_PULLUP|true|false)\b/g;
        const sketchRegex = /\b(setup|loop|if|else)\b/g;
        const functionsRegex = /\b(pinMode|digitalWrite|digitalRead|analogWrite|delay)\b/g;
        const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
        const lineCommentRegex = /\/\/(.*)/g;
        const highlightedCode = code
            .replace(keywordRegex, '<span class="blue">$&</span>')
            .replace(constantsRegex, '<span class="blue">$&</span>')
            .replace(sketchRegex, '<span class="green">$&</span>')
            .replace(functionsRegex, '<span class="orange">$&</span>')
            .replace(blockCommentRegex, '<span class="gray">$&</span>')
            .replace(lineCommentRegex, '<span class="gray">$&</span>');

        codeElement.innerHTML = highlightedCode;
    });
});
