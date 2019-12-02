const {spawn} = require('child_process');
const formidable = require('formidable');
const uuid = require('uuid/v3');
const {readFileSync} = require('fs');
const { join } = require('path');

module.exports = (req, res) => {
  const output_UUID = uuid('http://example.com/hello', uuid.URL); 
  
  const form = new formidable.IncomingForm();
  let file;

  form
      .on('file', (field, uploadedFile) => {
        if (field === 'file' && file === undefined) {
          // Ignore files that are not the correct name, or more than one.
          file = uploadedFile;
        }
      })
      .on('end', function() {
        res.writeHead(200, {'content-type': 'text/html', 'content-dispostion': `name=${output_UUID}`})
     
        const pdfinfo = join(__dirname, 'bin', 'pdftohtml');
        console.log('LD_PATH', `${__dirname}/bin:${process.env.LD_LIBRARY_PATH}`)
        const pdf = spawn(pdfinfo, ['-s', file.path, `/tmp/${output_UUID}.html`], {
          "env": {
            "LD_LIBRARY_PATH": `${__dirname}/bin`
          } 
        });

        pdf.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });

        pdf.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });

        pdf.on('close', (code, signal) => {
          console.log(`child process exited with code ${code} ${signal}`);
          res.write(readFileSync(`/tmp/${output_UUID}.html`));
          res.end();
        });       
      });
    form.parse(req); 
};