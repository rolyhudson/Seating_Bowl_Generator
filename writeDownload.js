function postAWS(file,name,bucketName) {
            var upload =false;
            var start = new Date().getTime() / 1000

            if (file) {
                //results.innerHTML = '';
                //need a user specific file name?
                var objKey = 'bowlAPPfiles' + '/' + name;
                var params = {Key: objKey, ContentType: ".txt",Body: file,ACL: 'public-read'};
                bucket.putObject(params, function (err, data) {

                    if (err) {
                        output.innerHTML = 'ERROR: ' + err;                            
                    } else {
                         upload =true;

                            var params = {
                                Bucket: 'rolyhudsonb', /* required */
                                Key: objKey, /* required */
                            };
                        var url = bucket.getSignedUrl('getObject', params);
                        console.log('The URL is', url);
                        var end = new Date().getTime() / 1000
                        var n = end-start;
                        output.innerHTML += ' <a href='+url+'>Download dxf/ifc,</a> created in '+Math.round(n* 100) / 100+'s. Right click and select "save link as..."';
                         
                       // listObjs();
                    }
                });
            } else {
                output.innerHTML = 'Nothing to upload.';
            }

            if(upload){//try and download
                   params = {
                            Bucket: bucketName, /* required */
                            Key: objKey} /* required */
                        bucket.getObject(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     console.log(data);           // successful response
                        });
            }
        }


