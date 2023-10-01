window.addEventListener('DOMContentLoaded', () => {
    const codeElements = document.querySelectorAll('code.language-arduino');
    codeElements.forEach((codeElement) => {
        const codeText = codeElement.textContent;
        const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
        const lineCommentRegex = /\/\/(.*)/g;
        const variablesRegex = /\b(void|const|int|bool|char|double|float|long|string)(?![^<]*<\/span>)\b/g;
        const classRegex = /\b(class|private|public)(?![^<]*<\/span>)\b/g;
        const constantsRegex = /\b(LOW|HIGH|INPUT|OUTPUT|INPUT_PULLUP|LED_BUILTIN|true|false)(?![^<]*<\/span>)\b/g;
        const sketchRegex = /\b(setup|loop|if|else|for|while|break|continue|return|do)(?![^<]*<\/span>)\b/g;
        const functionsRegex = /\b(pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay)(?![^<]*<\/span>)\b/g;
        const numberRegex = /(\b\d+(\.\d+)?\b)(?![^<]*>|[^<>]*<\/)/g;
        const highlightedCode = codeText
            .replace(blockCommentRegex, '<span class=\"gray\">$&</span>')
            .replace(lineCommentRegex, '<span class=\"gray\">$&</span>')
            .replace(variablesRegex, '<span class=\"blue\">$&</span>')
            .replace(classRegex, '<span class=\"blue\">$&</span>')
            .replace(constantsRegex, '<span class=\"blue\">$&</span>')
            .replace(sketchRegex, '<span class=\"green\">$&</span>')
            .replace(functionsRegex, '<span class=\"orange\">$&</span>')
            .replace(numberRegex, '<span class=\"red\">$&</span>')
        codeElement.innerHTML = highlightedCode;
    });
});
