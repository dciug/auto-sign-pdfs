/*
 * Use of an object to emulate a unique namespace.
 *
 * Object literals act like global variables
 * defined within this particular namespace.
 */
if (typeof ACROSDK == "undefined")
	var ACROSDK = {};
	
/* 
 * password to use the digital signature
 *
 * to test the sample without user input, specify:
 * ACROSDK.sigUserPwd = "testpassword";
 */
ACROSDK.sigUserPwd = "UNKNOWN";

/* 
 * path to the digital signature file
 *
 * to test the sample without user input, specify:
 * ACROSDK.sigDigitalIDPath = "/C/DrTest.pfx";
 */
ACROSDK.sigDigitalIDPath = "UNKNOWN";
ACROSDK.sigUserCertificate = "UNKNOWN";

// other variables the user can modify 
ACROSDK.sigHandlerName = "Adobe.PPKLite";
ACROSDK.sigFieldname = "sdk-signature";
ACROSDK.sigReason = "I am approving this document.";
ACROSDK.sigLocation = "";
ACROSDK.sigContactInfo = "";

if ( typeof sdkMenuItem == "undefined")
	var sdkMenuItem = false;
	
if (!sdkMenuItem) {
	sdkMenuItem = true;
	app.addSubMenu( { 
		cName:"ACROSDK:JSSubMenu", 
		cUser: "Acrobat SDK JavaScript", 
		cParent: "Edit", 
		nPos: 0
	});
}


// Add a menu item for AddSignature
app.addMenuItem( { 
	cName: "ACROSDK:AddSignature", 
	cUser: "Sign all active documents", 
	cParent: "ACROSDK:JSSubMenu", 
	cEnable: "event.rc = (event.target != null);",
	cExec: "AddSignature(event.target)"    
});


var myEngine = security.getHandler("Adobe.PPKLite");
var ids = myEngine.digitalIDs;
var myCerts = ids.certs;


function certToString(cert) {
	const vs = cert.validityStart.toISOString().substring(0, 10);
	const ve = cert.validityEnd.toISOString().substring(0, 10);

	return cert.subjectCN + " (" + cert.issuerDN.cn + ") | Valid from " + vs + " to " + ve + "  ";
}

/**
 * main function
 */ 
function AddSignature(doc)
{
	var opts = {};
	for (var i = 0; i < myCerts.length; i++) {
		// Select first option by default
		opts[certToString(myCerts[i])] = (i == 0 ? +(i + 1) : (-1) * (i + 1));
	}
	
	var sigFieldOpts = {};
	var sfc = 0;
	for (var fieldNumber = 0; fieldNumber < doc.numFields; fieldNumber++)
	{
	  const fn = doc.getNthFieldName(fieldNumber);
	  const ff = doc.getField(fn);
	  if (ff.type === "signature") {
		  //  Auto-select first valid signature field
		  sigFieldOpts[fn] = (sfc == 0 ? +(sfc + 1) : (-1) * (sfc + 1));
		  sfc += 1;
	  }
	}
	sigFieldOpts["New signature field (top left)"] = (-1)  * (sfc + 1);
	
	var sigFieldName = "UNKNOWN"
	var myDialog =
		{
		initialize: function(dialog) { // Set up and store the values in list_box
			dialog.load({
				"sub1": opts,
				"sub2": sigFieldOpts
			});
		},

		commit: function(dialog) {
			// Retrieve the values stored in list_box
			var elements = dialog.store();
			// Iterate through items and take actions as needed
			for (var e in elements["sub1"]) {
				// If the value is positive, it was selected:
				if (elements["sub1"][e] > 0) {
					rc = elements["sub1"][e];
					SetUserCertificate(myCerts[rc - 1]);
				}
			}
			for (var e in elements["sub2"]) {
				if (elements["sub2"][e] > 0) {
					rc = elements["sub2"][e];;
					sigFieldName = Object.keys(sigFieldOpts)[rc - 1];
				}
			}
		},


		// Dialog object descriptor (root node)
		description: {
			name: "Select your digital ID",
			elements: [
				{
					type: "view",
					align_children: "align_left",
					elements: [
						{
							type: "cluster",
							name: "Sign As",
							align_children: "align_fill",
							elements: [
								{
									type: "popup",
									item_id: "sub1",
									variable_Name: "sub1",
									width: 320,
								},
							]
						},
						{
							type: "cluster",
							name: "Signature field",
							align_children: "align_fill",
							elements: [
								{
									type: "popup",
									item_id: "sub2",
									variable_Name: "sub2",
									width: 320,
								},
								{
									type: "ok_cancel"
								}
							]
						}
					]
				}
			]
		}
	};
	rc = app.execDialog(myDialog);
	if (rc === "cancel") {
		return;
	}
	
	// if ACROSDK.sigUserPwd is not spcified, ask for user input
	if(ACROSDK.sigUserPwd == "UNKNOWN"){
		var cResponse = app.response({
				cQuestion: "Enter certificate password and click Ok",
				cTitle: "Certificate password",
				bPassword: true,
				cLabel: "Password",
				cDefault:  ""
		});
		
		if ( cResponse == null) {
			ACROSDK.sigUserCertificate = "UNKNOWN";
			ACROSDK.sigUserPwd = "UNKNOWN";
			return
		}
		else
			SetUserPassword(cResponse);
	}

	DoSignAllDocuments(sigFieldName);
}


DoSignAllDocuments = app.trustedFunction(function (sigFieldName) {
	try {
		app.beginPriv();
		try {
			myEngine.login({
				oParams: {
					cPassword: ACROSDK.sigUserPwd,
					iSlotID: 1,
					oEndUserSignCert: ACROSDK.sigUserCertificate
				}
			});
		} catch (e) {
			ACROSDK.sigUserCertificate = "UNKNOWN";
			ACROSDK.sigUserPwd = "UNKNOWN";
			app.alert("Incorrect password.");
			return;
		}

		var len = app.activeDocs.length;
		app.alert("Signing " + len + (len == 1 ? " document." : " documents."), 3);
		for (var i = 0; i < len; i++) {
			var d = app.activeDocs[i];
			var sigField = d.getField(sigFieldName);
			if (sigField) {
				// Sign in the existing field labeled "Signature", if exists.
				Sign(sigField, ACROSDK.sigHandlerName);
			} else {
				// Check if a signature field already exists, reset and remove it.
				sigField = d.getField(ACROSDK.sigFieldname);
				if (sigField) {
					app.alert("Signature field already exists: " + ACROSDK.sigFieldname, 3);
				} else {
					// create a new signature field
					var signatureField = AddSignatureField(d);

					// sign it
					if (signatureField)	Sign(signatureField, ACROSDK.sigHandlerName);
				}
			}
		}
		
		myEngine.logout();
		app.endPriv();
	} catch (e) {
		ACROSDK.sigUserCertificate = "UNKNOWN";
		ACROSDK.sigUserPwd = "UNKNOWN";
		app.alert("Something went wrong: " + d.documentFileName);
	}
});


/**
 * create a signature field in the upper left conner with name of ACROSDK.sigFieldname
 */
function AddSignatureField(doc) {
	var inch = 72;
	var aRect = doc.getPageBox( { nPage: 0 } );
	aRect[0] += 0.5 * inch; // from upper left hand corner of page.
	aRect[2] = aRect[0] + 2 * inch; // Make it 2 inch wide
	aRect[1] -= 0.5 * inch;
	aRect[3] = aRect[1] - 0.5 * inch; // and 0.5 inch high

	var sigField = null;
	try {
		sigField = doc.addField(ACROSDK.sigFieldname, "signature", 0, aRect);
	} catch (e) {
		console.println("An error occurred: " + e);
	}

	return sigField;
}


/**
 * define the Sign function as a privileged function
 */ 
Sign = app.trustedFunction(
	function( sigField, DigSigHandlerName )
	{
	  try {
		app.beginPriv();

		var siginfo = sigField.signatureSign({oSig: myEngine, 
								bUI: false,
								oInfo: { password: ACROSDK.sigUserPwd, 
										reason: ACROSDK.sigReason,
										location: ACROSDK.sigLocation,
										contactInfo: ACROSDK.sigContactInfo}
								});
		app.endPriv();
	  } catch (e) {
			console.println("An error occurred: " + e);
	  }
	}
);


/** 
 * set a correct password for using the signature, so you can quietly sign a doc.
 */
function SetUserPassword(pwd) {
	ACROSDK.sigUserPwd = pwd;
}


/** 
 * set path to the digital signature file
 */
function SetUserDigitalIDPath(idPath) {
	ACROSDK.sigDigitalIDPath = idPath;
}


function SetUserCertificate(cert) {
	ACROSDK.sigUserCertificate = cert;
}