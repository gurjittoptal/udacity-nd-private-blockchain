# Private Blockchain Application

Create a private blockchain to track all star information submitted by users. When posting users need to sign request so ownership can be tracked. specifically get requestValidation (b.) and sign and addStar (c.)


Install and Run
npm install
npm start

a. initialize blockchain
http://localhost:8000/block/height/:id [GET]
e.g. to initialize
http://localhost:8000/block/height/0

b. request validation
http://localhost:8000/requestValidation [POST]
e.g Pass json in body
{"address":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp"}
Response
{"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp:1624208835:starRegistry"}
Format <address>:<timestamp>:starRegistry

The response above needs to be signed and passed in c using bitcoin core or electrum wallet

c. add a star
http://localhost:8000/submitstar [POST]
e.g. Pass json in body (sample that always works)
{
    "address":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp",
    "signature":"Hz/Cpvz7u6sHBclp+fMAdcyuvyguMIg7qfaxkZCgSNaqRqGedLgEHbytdBg24GfW8FBtb/z2sguPPY8FM9xsCkw=",
    "message":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp:1824163113:starRegistry",
    "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "yolo3"
	}
}

d. get block by hash [POST]
http://localhost:8000/block/hash/:hash

e. validate chain
http://localhost:8000/validateChain [GET]
returns an array of errors if there

f. get stars by owner
localhost:8000/blocks/:owner
where owner is address of owner e.g. bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp
