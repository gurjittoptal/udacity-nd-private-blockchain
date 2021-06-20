# Private Blockchain Application

Create a private blockchain to track all star information submitted by users. When posting users need to sign request so ownership can be tracked. specifically get requestValidation (b.) and sign and addStar (c.)


Install and Run<br/>
npm install<br/>
npm start

a. initialize blockchain<br/>
http://localhost:8000/block/height/:id [GET]<br/>
e.g. to initialize<br/>
http://localhost:8000/block/height/0<br/>

b. request validation<br/>
http://localhost:8000/requestValidation [POST]<br/>
e.g Pass json in body<br/>
{"address":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp"}<br/>
Response<br/>
{"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp:1624208835:starRegistry"}<br/>
Format [address]:[timestamp]:starRegistry

The response above needs to be signed and passed in c using bitcoin core or electrum wallet

c. add a star<br/>
http://localhost:8000/submitstar [POST]<br/>
e.g. Pass json in body (sample that always works)<br/>
{
    "address":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp",
    "signature":"Hz/Cpvz7u6sHBclp+fMAdcyuvyguMIg7qfaxkZCgSNaqRqGedLgEHbytdBg24GfW8FBtb/z2sguPPY8FM9xsCkw=",
    "message":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp:1824163113:starRegistry",
    "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "yolo3"
	}
}<br/>

d. get block by hash [POST]<br/>
http://localhost:8000/block/hash/:hash<br/>

e. validate chain<br/>
http://localhost:8000/validateChain [GET]<br/>
returns an array of errors if there

f. get stars by owner<br/>
localhost:8000/blocks/:owner<br/>
where owner is address of owner e.g.<br/> bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp
