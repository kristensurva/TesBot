//import {PythonShell} from 'python-shell';
const { PythonShell } = require('python-shell');

async function pythonScriptQuote(input) {

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './scripts', 
    args: [input]
  };

  const { success, err = '', results } = await new Promise((resolve, reject) => {
    PythonShell.run('pythonQuote.py', options, function(err,results) {
      if (err) {
        console.log(err)
        reject({ success: false, err });
      }
      resolve({ success: true, results });
    });
  });
    if (success) {
      return results[0]
    }
}

async function pythonScriptCount(text, top) {

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './scripts', 
    args: [text, top]
  };

  const { success, err = '', results } = await new Promise((resolve, reject) => {
    PythonShell.run('pythonCount.py', options, function(err,results) {
      if (err) {
        console.log(err)
        reject({ success: false, err });
      }
      resolve({ success: true, results });
    });
  });
    if (success) {
      return results[0]
    }
}

module.exports = {
  pythonScriptQuote,
  pythonScriptCount
}