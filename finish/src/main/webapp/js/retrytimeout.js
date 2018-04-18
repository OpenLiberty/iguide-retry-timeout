/** 
  Copyright (c) 2018 IBM Corporation and others.
  All rights reserved. This program and the accompanying materials
  are made available under the terms of the Eclipse Public License v1.0
  which accompanies this distribution, and is available at
  http://www.eclipse.org/legal/epl-v10.html
 
  Contributors:
      IBM Corporation - initial API and implementation
*/
document.getElementById("viewTransactions").onclick();
    
function requestTransactions (e) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                document.getElementById('content').innerHTML = request.responseText;
            } else {
                document.getElementById("content").innerHTML = "<h3 style='text-align:center;'>Transactions could not be retrieved.</h3>";
            }
            document.getElementById('connecting').style.display='none';
        }
    };
    request.open("GET", "/retryTimeoutSample/Bank/transactions", true);
    request.setRequestHeader('Content-type', 'text/html');
    request.send();
};