const html2ssml = require('./');
html2ssml();
const parse5 = require('parse5');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');
const fileName = path.resolve(__dirname,'test/test.html');
fs.readFile(fileName,'utf-8',function(err,data){
  // const document = parse5.parseFragment(data);
  // const html = parse5.serialize(document);
  const $ = cheerio.load(data);
  let d = $("p");
  var con="";
  const text = htmlToText.fromString(data);
  console.log(text);
  $('figure').remove()
  $('a').remove()
  $('img').remove()
  let bq =  $('blockquote');
  let all = $("*");
  let tags = [];
  for (let i=0, max=all.length; i < max; i++) {
    tags.push(all[i].tagName);
  }
  uniqueTags = [...new Set(tags)];

  uniqueTags.map((e,i)=>{
    if(e == "html" || e == "head" | e == "body") return;
    console.log("==============================");
    console.log(e)
    let nodes = $(e);
    console.log(nodes.length,e);
    if(nodes.length>1){
      $("p").each((i,el)=>{
        // console.log($(this),i)
      });
    }
    // else {
      console.log(nodes.html())
    // }
    console.log("==============================");
  })
  // console.log(typeof data);
  // let d = data.replace(/<ul>/ig,'<s>');
  // d = d.replace(/<(\/)ul>/ig,'</s>');
  // d = d.replace(/<li>/ig,'<s>');
  // d = d.replace(/<(\/)li>/ig,'</s>');
  // d = d.replace(/\n/g, " ");
  // d = d.replace(/<a/g,'<s');
  // d = d.replace(/<\/a>/g,'</s>');
  fs.writeFile('dh.html',text,function(err,d){

  });
  // for(i=0;i<document.childNodes.length;i++){
  //   console.log(document.childNodes[i])
  //   console.log("=============================================================")
  // }
  // const str = parse5.serialize(document.childNodes);
});
