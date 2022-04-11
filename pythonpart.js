//import {PythonShell} from 'python-shell';
import { PythonShell } from 'python-shell';

async function pythonScriptQuote({ user = "" }) {

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './scripts',
    args: [user]
  };

  const { success, results } = await new Promise((resolve, reject) => {
    PythonShell.run('pythonQuote.py', options, function (err, results) {
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

async function pythonScriptCount({ text, top = 15 }) {

  let options = {
    mode: 'text',
    pythonOptions: ['-u'],
    scriptPath: './scripts',
    args: [text, top]
  };

  const { success, results } = await new Promise((resolve, reject) => {
    PythonShell.run('pythonCount.py', options, function (err, results) {
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

export {
  pythonScriptQuote,
  pythonScriptCount
}