const languageArr = ['English,en', '普通话,zh', 'हिंदी,hi', 'Española,es', 'française,fr', 'العربية الفصحى,ar', 'বাঙ্গালি,bn', 'русский,ru', 'Português,pt', 'Indonesia,id', 'Afrikaans,af']


function getFullLang(langCode) {
    for (let index = 0; index < languageArr.length; index++) {
        const element = languageArr[index];
        if (element.split(",")[1] == langCode) {
            return element.split(",")[0]
        }
    }
    throw new Error("invalid lang code")
}

function getLangCode(fullLang) {
    for (let index = 0; index < languageArr.length; index++) {
        const element = languageArr[index];
        if (element.split(",")[0] == fullLang) {
            return element.split(",")[1]
        }
    }
    throw new Error("invalid lang code")
}