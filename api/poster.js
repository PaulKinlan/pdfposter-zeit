const {spawn} = require('child_process');
const formidable = require('formidable');
const uuid = require('uuid/v3');
const {readFileSync} = require('fs');

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
        res.writeHead(200, {'content-type': 'image/pdf', 'content-dispostion': `name=${output_UUID}`})
     
        const ls = spawn('/usr/local/bin/pdfposter', ['-s1', file.path, `/tmp/${output_UUID}`]);

        ls.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
          res.send(readFileSync(`/tmp/${output_UUID}`))
        });

       
      });
    form.parse(req); 
};