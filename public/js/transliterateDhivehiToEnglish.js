const transliterationMap = {
    'ް':'c',
    'އ':'a',
    'ެ':'e',
    'ރ':'r',
    'ތ':'t',
    'ޔ':'y',
    'ު':'u',
    'ި':'i',
    'ޮ':'o',
    'ޕ':'p',
    'ޕ':'P',
    'ަ':'w',
    'ސ':'s',
    'ދ':'d',
    'ފ':'f',
    'ގ':'g',
    'ހ':'h',
    'ޖ':'j',
    'ކ':'k',
    'ލ':'l',
    'ޒ':'z',
    '×':'x',
    'ޝ':'x',
    'ޗ':'C',
    'ވ':'v',
    'ބ':'b',
    'ނ':'n',
    'މ':'m',
    'ﷲ':'Q',
    'ޢ':'A',
    'ޭ':'E',
    'ޜ':'R',
    'ޓ':'T',
    'ޠ':'Y',
    'ޫ':'U',
    'ީ':'I',
    'ޯ':'O',
    'ާ':'W',
    'ށ':'S',
    'ޑ':'D',
    'ޟ':'F',
    'ޣ':'G',
    'ޙ':'H',
    'ޛ':'J',
    'ޚ':'K',
    'ޅ':'L',
    'ޡ':'Z',
    'ޘ':'X',
    'ޤ':'q',
    'ޥ':'V',
    'ޞ':'B',
    'ޏ':'N',
    'ޟ':'M',
    '،':',',
    '؛':';',
    '؟':'?',
    '>':'<',
    '<':'>',
    ']':'[',
    '[':']',
    ')':'(',
    '(':')',
    '}':'{',
    '{':'}',
};



function transliterateDhivehiToEnglish(text) {
  const splitText = text.split(/(\d+)/);
  let dhivehiTextIndices = []; 
  splitText.forEach((part, index) => {
      if (!/^\d+$/.test(part)) {
          dhivehiTextIndices.push(index); 
      }
  });

  const reversedDhivehiText = dhivehiTextIndices.map(index => 
      Array.from(splitText[index], char => transliterationMap[char] || char).reverse().join('')
  );

  let transliteratedResult = ''; 
  let dhivehiTextIndex = 0;
  
  for (let i = 0; i < splitText.length; i++) {
      if (dhivehiTextIndices.includes(i)) {
          transliteratedResult += reversedDhivehiText[dhivehiTextIndex++];
      } else {
          transliteratedResult += splitText[i];
      }
  }

  const transliteratedDhivehiText = dhivehiTextIndices.map(index => 
      Array.from(splitText[index], char => transliterationMap[char] || char).reverse().join('')
  );
  const numbersInText = transliteratedResult.match(/\d+/g); 
  let numericValues = numbersInText ? numbersInText.map(Number) : [];
  let reversedNumericValues = numericValues.reverse();

  let finalTransliteratedText = transliteratedDhivehiText.reverse(); 
  transliteratedResult = finalTransliteratedText.map((item, index) => {
      let separator = index === finalTransliteratedText.length - 1 ? '' : reversedNumericValues[index % reversedNumericValues.length];
      return item + separator;
  });

  for (let index = 0; index < transliteratedResult.length; index++) {
      if (transliteratedResult[index] == "undefined") {
          transliteratedResult.pop();
      }
  }

  let finalOutput = transliteratedResult.join('');
  return finalOutput; 
}