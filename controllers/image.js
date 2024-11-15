const Clarifai = require('clarifai');

const {
    REACT_APP_CLARIFAI_PAT,
    REACT_APP_USER_ID,
    REACT_APP_APP_ID
} = process.env

// const returnClarifaiRequestOptions = (imageUrl) => {
//     const PAT = REACT_APP_CLARIFAI_PAT;
//     const USER_ID = REACT_APP_USER_ID;
//     const APP_ID = REACT_APP_APP_ID;
//     const IMAGE_URL = imageUrl;

//     const raw = JSON.stringify({
//         "user_app_id": {
//             "user_id": USER_ID,
//             "app_id": APP_ID
//         },
//         "inputs": [{
//             "data": {
//                 "image": {
//                     "url": IMAGE_URL
//                 }
//             }
//         }]
//     });

//     const requestOptions = {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Authorization': 'Key ' + PAT
//         },
//         body: raw
//     };

//     return requestOptions;
// }

const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

// This will be used by every Clarifai endpoint call
const metadata = new grpc.Metadata();
const PAT = REACT_APP_CLARIFAI_PAT;
metadata.set("authorization", "Key " + PAT);

const USER_ID = REACT_APP_USER_ID;
const APP_ID = REACT_APP_APP_ID;



// fetch("https://api.clarifai.com/v2/models/face-detection/outputs", returnClarifaiRequestOptions(req.body.input))
//         .then(data => {
//             res.json(data);
//         })
//         .catch(err => res.status(400).json('unable to work with API'))

const handleApiCall = (req, res) => {

    console.log(USER_ID);
    console.log(APP_ID);
    console.log(PAT);

    stub.PostModelOutputs(
        {
            user_app_id: {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            model_id: 'face-detection',
            inputs: [
                { data: { image: { url: req.body.input, allow_duplicate_url: true } } }
            ]
        },
        metadata,
        (err, response) => {
            if (err) {
                throw new Error(err);
            }
    
            if (response.status.code !== 10000) {
                throw new Error("Post model outputs failed, status: " + response.status.description);
            }
    
            // Since we have one input, one output will exist here
            const output = response.outputs[0];
    
            console.log("Predicted concepts:");
            for (const concept of output.data.concepts) {
                console.log(concept.name + " " + concept.value);
            }
            res.json()
        }
    
    );
}

const handleImage = (req, res, db) => {
    const {
        id
    } = req.body;

    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);
        })
        .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
    handleImage,
    handleApiCall
}