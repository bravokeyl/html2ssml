const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp');
const WPAPI = require( 'wpapi' );
const wp = new WPAPI({ endpoint: 'https://wptavern.com/wp-json/' });
const htmlToText = require('html-to-text');
const splitAt = require('split-at');
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
});

const divideTextEnoughToBeHandleByPolly = (text) => {
  let len = parseInt(text.length/1000);
  let splitArr = [];
  for(i=0;i<len;i++) {
    splitArr.push((i+1)*1000)
  }
  // console.log(splitArr)
  return splitAt(text,splitArr);
}

const generatePollyAudio = (text, voiceId,index,fileName) => {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voiceId
  }
  console.log("Processing part",index,"of",fileName,"...");
  return Polly.synthesizeSpeech(params).promise().then( audio => {
    if (audio.AudioStream instanceof Buffer){
      let fn = fileName+"-"+index+".mp3";
      console.log("Creating audio file:",fileName," ...");
      fs.writeFile(fn, audio.AudioStream, function(err) {
          if (err) {
              return console.log(err)
          }
          console.log("Part",index,"audio file was saved!")
      });
      return audio
    }
    else throw 'AudioStream is not a Buffer.'
  })

}


const audioBuffer = async (text,id,fileName) => {
  const voiceId = 'Brian';
  const parts = divideTextEnoughToBeHandleByPolly(text);
  console.log("File:",fileName,"is split into ", parts.length," parts");
  let audios = [];
  try {
    for(let [index,part] of parts.entries()){
      audio = await generatePollyAudio(part, voiceId,index+1,fileName);
      audios.push(audio);
    }
    const audioStreams = audios.map(a => a.AudioStream)
    const buf = Buffer.concat(audioStreams, audioStreams.reduce((len, a) => len + a.length, 0))

    fs.writeFile(fileName, buf, function(err) {
        if (err) {
            return console.log(err)
        }
        console.log("Audio file was saved!")
    });
  }
  catch (e) {
      console.log(e)
  }

}

const doPolly = (content,id,fileName) => {
  const options = {
    ignoreHref: true,
    ignoreImage: true,
    noLinkBrackets: true,
  }
  const text = htmlToText.fromString(content, options);
  fs.writeFile(fileName+".txt", text, function(err) {
      if (err) {
          return console.log(err)
      }
      // console.log("Text file was saved!")
  });
  console.log(text.length)
  audioBuffer(text,id,fileName);
}
const processPost = (e) => {
  console.log(e.id,e.slug);
  let d = path.resolve(__dirname,"wp/"+e.slug)
  let fileName = d+"/"+e.id;
  mkdirp.sync(d);
  doPolly(e.content.rendered,e.id,fileName)
}
wp.posts().perPage("1").get(function( err, data ) {
    if ( err ) {
      console.log(err)
    }
    let posts = [];
    if(!Array.isArray(data)) {
      processPost(data)
    } else {
      console.log("Getting ",data.length," posts")
      data.forEach((e,i)=>{
        processPost(e);
      });
    }
});
