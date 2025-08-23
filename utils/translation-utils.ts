
// interface MessageStructure {
//     [key: string]: string
// }

// import csMessages from "../locales/cs.json";
// import daMessages from "../locales/da.json";
// import deMessages from "../locales/de.json";
// import enMessages from "../locales/en.json";
// import esMessages from "../locales/es.json";
// import fiMessages from "../locales/fi.json";
// import frMessages from "../locales/fr.json";
// import hiMessages from "../locales/hi.json";
// import itMessages from "../locales/it.json";
// import jaMessages from "../locales/ja.json";
// import koMessages from "../locales/ko.json";
// import nlMessages from "../locales/nl.json";
// import noMessages from "../locales/no.json";
// import plMessages from "../locales/pl.json";
// import ptMessages from "../locales/pt.json";
// import ruMessages from "../locales/ru.json";
// import svMessages from "../locales/sv.json";
// import viMessages from "../locales/vi.json";
// import zhMessages from "../locales/zh.json";

// const MessagesMap = {
//     cs: csMessages as MessageStructure,
//     da: daMessages,
//     en: enMessages
// }


// const MessageMap2 = new Map<string, MessageStructure>([
//     ["cs", csMessages]
// ]);

// export function getTranslatedMessage(languageCode: string, messageKey: string){

//     const t1 = MessagesMap.cs[messageKey];

//     const t = MessageMap2.get(languageCode);
//     if(t){
//         t[messageKey];
//     }
//     return "";  
    
// }