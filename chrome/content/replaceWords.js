console.log("LOG: Running replaceWords.js");

var languageCode = "";

function makeArrayAndReturnObject() {
  var res = $('body  *').contents().map(function () {
      if (this.nodeType == 3 && this.nodeValue.trim() != "") //check for nodetype==3 which is text and ignore empty text nodes
          return this.nodeValue.trim().split(/\W+/);  //split the nodevalue to get words.
  }).get(); //get the array of words.
  for (i = 0; i < res.length; i++){
    res[i] = res[i].toLowerCase();
  }
  var wordObj = _.countBy(res);
  var sortable = [];
  for (var word in wordObj) {
      sortable.push([word, wordObj[word]]);
  }

  sortable.sort(function(a, b) {
      return b[1] - a[1];
  });

  return sortable;
  // let uniq_out = [...new Set(res)]; //deletes duplicate elements
  // return uniq_out;
}

function replaceWord(initialWord, newWord){
  findAndReplaceDOMText(document.body, {
    find: initialWord,
    replace: initialWord + " " + newWord,
    wrap: 'span',
    wrapClass: 'lovelangReplace'
    }
  );
}

replaceWord("wiki", "how");

function fetchResource(input, init) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({input, init}, messageResponse => {
      const [response, error] = messageResponse;
      if (response === null) {
        reject(error);
      } else {
        // Use undefined on a 204 - No Content
        const body = response.body ? new Blob([response.body]) : undefined;
        resolve(new Response(body, {
          status: response.status,
          statusText: response.statusText,
        }));
      }
    });
  });
}
var arr = makeArrayAndReturnObject();

var translatedArr = [];

// Add CSS to the second element in the replace things
var toBold = document.getElementsByClassName('lovelangReplace');

for (var i = 0 ; i< toBold.length; ++i) {
  var temp = toBold[i].innerText;
  temp = temp.replace(' ', "'>");
  toBold[i].innerHTML = "<p style='display:inline;' data-tooltip='" + temp + "</p>";
  console.log("<p data-tooltip='" + temp + "</p>");
}

// The program starts here


chrome.storage.local.get('language', function(result) {
  // Gets the language for the current user

  languageCode = result.language;

  console.log(languageCode);

  // Make the whole program inside this

  var word = ["modify", "structure"];

  for (i = 0; i < word.length; i++) {

    fetchResource('https://translation.googleapis.com/language/translate/v2?q=' +
    word[i] + '&target=' + languageCode +
    '&key=AIzaSyBDLTCqbkRxMAu8zVF-j1zYOPgm3oDtdvo').then(r => r.text()).then(result => {

      var jsonResult = JSON.parse(result);
      console.log(jsonResult);
      console.log(jsonResult.data.translations[0].translatedText);

      var stringOfTranslation = jsonResult.data.translations[0].translatedText;

      replaceWord(word[i], stringOfTranslation);

    });
  }


});
