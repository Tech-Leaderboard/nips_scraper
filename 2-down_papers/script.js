const https = require('https');
const fs = require('fs');
const parse = require('csv-parse');

const input_file_path ='../1-get_author_paper_list/nips.csv';
const fileContents = fs.readFileSync(input_file_path);
const lines = fileContents.toString().trim().split('\n');
const BASE_URL = 'https://papers.nips.cc';


function download_pdf(file_url) {
  var file = fs.createWriteStream('./papers/' + file_url.substring(7));
  var request = https.get(BASE_URL + file_url, function(response) {
    response.pipe(file);
  });
  console.log(BASE_URL + file_url);
}

var file_set = new Set();
const pdfs_to_get  = [];
lines.forEach((line) => {
  parse(line, (err, output) => {
    if (err) {
      console.error(`NON-STANDARD LINE: ${line}`);
    } else {
      const cols = output[0];
      if (!file_set.has(cols[3])) {
        file_set.add(cols[3]);
        pdfs_to_get.push(cols[3] + '.pdf');
      }
    }
  });
});
let cnt = 0;
const nIntervId = setInterval(() => {
  if (cnt < pdfs_to_get.length) {
    download_pdf(pdfs_to_get[cnt]);
    cnt = cnt + 1;
  } else {
    clearInterval(nIntervId);
  }
}, 250);
/*
var file = fs.createWriteStream("6606.pdf");
var request = https.get("https://papers.nips.cc/paper/6606-wider-and-deeper-cheaper-and-faster-tensorized-lstms-for-sequence-learning.pdf", function(response) {
  response.pipe(file);
});*/


/*var fs = require("fs");
var pdfreader = require('pdfreader');


var items = [];
function write_new_rec(items) {
  console.log(items.slice(0, 100).join(' '));
};

fs.readFile("./6176-a-scaled-bregman-theorem-with-applications", (err, pdfBuffer) => {
  // pdfBuffer contains the file content
  new pdfreader.PdfReader().parseBuffer(pdfBuffer, function(err, item){
    if (err) {
      callback(err);
    } else if (!item)  {
      write_new_rec(items);
      callback();
    } else if (item.text) {
      items.push(item.text);
    }
  });

});*/
