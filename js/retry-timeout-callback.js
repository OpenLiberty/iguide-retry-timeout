/*******************************************************************************
* Copyright (c) 2017 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     IBM Corporation - initial API and implementation
*******************************************************************************/
var retryTimeoutCallback = (function() {

    var bankServiceFileName = "BankService.java";
    var htmlRootDir = "/guides/draft-iguide-retry-timeout/html/";
    var __browserTransactionBaseURL = "https://global-ebank.openliberty.io/transactions";

    var listenToEditorForFeatureInServerXML = function(editor) {
        var saveServerXML = function(editor) {
            __saveServerXML(editor);
        };
        editor.addSaveListener(saveServerXML);
    };

    var addMicroProfileFaultToleranceFeatureButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addMicroProfileFaultToleranceFeature();
        }
    };

    var __addMicroProfileFaultToleranceFeature = function() {
        var FTFeature = "      <feature>mpFaultTolerance-1.0</feature>";
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, serverFileName);
        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);

        contentManager.insertTabbedEditorContents(stepName, serverFileName, 5, FTFeature);
        var readOnlyLines = [];
        // mark cdi feature line readonly
        readOnlyLines.push({
            from: 4,
            to: 4
        });
        contentManager.markTabbedEditorReadOnlyLines(stepName, serverFileName, readOnlyLines);
    };

    var __getMicroProfileFaultToleranceFeatureContent = function(content) {
        var editorContents = {};
        try {
            // match
            // <featureManager>
            //    <anything here>
            // </featureManager>
            // and capturing groups to get content before featureManager, the feature, and after
            // featureManager content.
            var featureManagerToMatch = "([\\s\\S]*)<featureManager>([\\s\\S]*)<\\/featureManager>([\\s\\S]*)";
            var regExpToMatch = new RegExp(featureManagerToMatch, "g");
            var groups = regExpToMatch.exec(content);
            editorContents.beforeFeature = groups[1];
            editorContents.features = groups[2];
            editorContents.afterFeature = groups[3];
        }
        catch (e) {
        }
        return editorContents;
    };

    var __getMicroProfileFaultToleranceFeatureContent = function(content) {
        var editorContents = {};
        try {
            // match
            // <featureManager>
            //    <anything here>
            // </featureManager>
            // and capturing groups to get content before featureManager, the feature, and after
            // featureManager content.
            var featureManagerToMatch = "([\\s\\S]*)<featureManager>([\\s\\S]*)<\\/featureManager>([\\s\\S]*)";
            var regExpToMatch = new RegExp(featureManagerToMatch, "g");
            var groups = regExpToMatch.exec(content);
            editorContents.beforeFeature = groups[1];
            editorContents.features = groups[2];
            editorContents.afterFeature = groups[3];
        }
        catch (e) {

        }
        return editorContents;
    };

    var __isFaultToleranceInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>mpFaultTolerance-1.0</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __isCDIInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>cdi-1.2</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __checkMicroProfileFaultToleranceFeatureContent = function(content) {
        var isFTFeatureThere = true;
        var editorContentBreakdown = __getMicroProfileFaultToleranceFeatureContent(content);
        if (editorContentBreakdown.hasOwnProperty("features")) {
            isFTFeatureThere =  __isFaultToleranceInFeatures(editorContentBreakdown.features) &&
                                __isCDIInFeatures(editorContentBreakdown.features);
            if (isFTFeatureThere) {
                // check for whether other stuffs are there
                var features = editorContentBreakdown.features;
                features = features.replace('\n', '');
                features = features.replace(/\s/g, '');
                if (features.length !== "<feature>mpFaultTolerance-1.0</feature><feature>cdi-1.2</feature>".length) {
                    isFTFeatureThere = false; // contains extra text
                }
            }
        } else {
            isFTFeatureThere = false;
        }
        return isFTFeatureThere;
    };

    var __correctEditorError = function(stepName) {
        // correct annotation/method
        if (stepName === "AddLibertyMPFaultTolerance") {
            __addMicroProfileFaultToleranceFeature();
        } else if (stepName === "TimeoutAnnotation") {
            __addTimeoutInEditor(stepName);
        } else if (stepName === "AddRetryOnRetry") {
            __addRetryOnRetryInEditor(stepName);
        } else if (stepName === "AddLimitsRetry") {
            __addLimitsRetryInEditor(stepName);
        }
    };

    var __saveServerXML = function(editor) {
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);
        if (__checkMicroProfileFaultToleranceFeatureContent(content)) {
            editor.closeEditorErrorBox(stepName);
            contentManager.markCurrentInstructionComplete(stepName);
        } else {
            // display error to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };

    var saveServerXMLButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.saveTabbedEditor(stepContent.getCurrentStepName(), "server.xml");
        }
    };

    var __saveButtonEditor = function(stepName) {
        contentManager.saveTabbedEditor(stepName, bankServiceFileName);
    };

    var saveButtonEditor = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __saveButtonEditor(stepName);
        }
    };

    var listenToEditorForTimeoutAnnotation = function(editor) {
        editor.addSaveListener(__showStartingBrowser)
    };

    var listenToEditorForRetryAnnotation = function(editor) {
        editor.addSaveListener(__showStartingBrowser);
    };

    var __showStartingBrowser = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);

        var htmlFile;
        if (stepName === "TimeoutAnnotation") {
            htmlFile = htmlRootDir + "transaction-history-timeout.html";
        } else if (stepName === "AddRetryOnRetry") {
            htmlFile = htmlRootDir + "transaction-history-retry-start.html";
        } 

        if (__checkEditorContent(stepName, content)) {
            editor.closeEditorErrorBox(stepName);
            var index = contentManager.getCurrentInstructionIndex();
            if (index === 0) {
                contentManager.markCurrentInstructionComplete(stepName);
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
                // display empty web browser
                contentManager.setPodContent(stepName, htmlFile);
                
                // resize the height of the tabbed editor
                contentManager.resizeTabbedEditor(stepName);               
            }
        } else {
            // display error and provide link to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };
    
    var __checkEditorContent = function(stepName, content) {
        var contentIsCorrect = true;
        if (stepName === "TimeoutAnnotation") {
            contentIsCorrect = __validateEditorTimeoutAnnotationStep(content);
        } else if (stepName === "AddRetryOnRetry") {
            contentIsCorrect = __validateEditorRetryOnRetryStep(content);
        }

        return contentIsCorrect;
    };

    var __validateEditorTimeoutAnnotationStep = function(content) {
        var match = false;
        try {  
            var pattern = "public class BankService {\\s*" + // readonly boundary
            "@\\s*Timeout\\s*\\(\\s*2000\\s*\\)\\s*" +
            "public Service showTransactions()"; // readonly boundary
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __validateEditorRetryOnRetryStep = function(content) {
        var match = false;
        try {
            var pattern = "public class BankService {\\s*" + // readonly boundary
            "@Retry\\s*\\(\\s*retryOn\\s*=\\s*TimeoutException\\.class\\s*\\)\\s*" +
            "@Timeout\\(2000\\)"; // readonly boundary
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch(ex) {

        }
        return match;
    };

    var __addTimeoutInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Timeout(2000)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 7, 7, newContent, 1);
    };

    var addTimeoutButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            __addTimeoutInEditor(stepName);
        }
    };

    var clickTransaction = function(event, stepName, numOfRequest) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
               var browser = contentManager.getBrowser(stepName);
               browser.setURL(__browserTransactionBaseURL);
               handleTransactionRequestInBrowser(stepName, numOfRequest);
        }
    };

    var handleTransactionRequestInBrowser = function(stepName, numOfRequest) {       
        var browserUrl = __browserTransactionBaseURL;
        var browser = contentManager.getBrowser(stepName);
        var browserContentHTML = htmlRootDir + "global-eBank.html";      
        
        if (numOfRequest !== -1) {        
            contentManager.markCurrentInstructionComplete(stepName);
        }            
        if (stepName === "TransactionHistory") {
            if (numOfRequest === 1) {
                browserContentHTML = htmlRootDir + "transaction-history.html";
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
            } else if (numOfRequest === 2) {
                browserContentHTML = htmlRootDir + "transaction-history-loading.html";
            }          
        } else if (stepName === "TimeoutAnnotation") {
            browserUrl = __browserTransactionBaseURL + "/error";
            contentManager.setBrowserURL(stepName, browserUrl, 0);
            browserContentHTML = htmlRootDir + "transaction-history-timeout-error.html";            
        } else if (stepName === "AddRetryOnRetry" || stepName === "AddLimitsRetry") {
            browserContentHTML = htmlRootDir + "transaction-history-loading.html";
        }

        browser.setBrowserContent(browserContentHTML);

        if (stepName === "AddRetryOnRetry") {
            showTransactionHistory(stepName, browser);
        } else if (stepName === "AddLimitsRetry") {
            showTransactionHistoryWithDashboard(stepName, browser, 3, 10000 /* 10s */, 0 /* Not set */, 0 /* Not set */);
        }
    };

    var showTransactionHistory = function(stepName, browser) {
        var loadingTimeInterval = setInterval(function() {
            clearInterval(loadingTimeInterval);
//        contentManager.setBrowserURL(stepName, browserURL);
            browser.setURL(__browserTransactionBaseURL);
            browser.setBrowserContent(htmlRootDir + "transaction-history.html");
        }, 2000);  // Timeout is set to 2000 milliseconds
    };

    var showTransactionHistoryWithDashboard = function(stepName, browser, timeoutsToSimulate, maxDurationInMS, delayInMS, jitterInMS) {
        var timeout = 2000;
        var timeoutCount = 0;
        var elapsedRetryProgress = 0;
        var $tickContainers = $("[data-step='" + stepName + "']").find('.tickContainer');
        var timeoutTickContainer = $tickContainers[0];
        var retryTickContainer = $tickContainers[1];
        var $progressBar = $("[data-step='" + stepName + "']").find('.progressBar').find('div');
    
        // Reset the tick containers for browser refreshes
        $(timeoutTickContainer).empty();
        $(retryTickContainer).empty();

        setProgressBar(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, 0, timeoutTickContainer, retryTickContainer, $progressBar);
    };

    /**
     * Sets the timeout and retry ticks in the dashboard. Invoked from setProgress()
     * when a timeout should occur.  Re-invokes setProgress for the next "iteration".
     * 
     * @param maxDurationInMS  - Max Duration in milliseconds
     * @param delayInMS        - Delay in milliseconds
     * @param jitterInMS       - Jitter in milliseconds
     * @param timeout          - Timeout value in milliseconds
     * @param timeoutCount     - Running count on how many timeouts have been 
     *                               processed.  Initialized to 0.
     * @param timeoutsToSimulate   - Number of timeouts to simulate.
     * @param elapsedRetryProgress - Running total of the number of milliseconds
     *                                   that have passed on the dashboard.
     * @param currentPctProgress   - Percent completed on dashboard
     * @param timeoutTickContainer - Where to place the timeout ticks
     * @param retryTickContainer   - Where to place the retry ticks
     * @param $progressBar         - JQuery object of the progress bar  
     */
    var setTicks = function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar) {
        timeoutCount++;

        // Show the timeout tick
        // Do the math...
        var timeoutTickPlacement = Math.round((elapsedRetryProgress/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
        //console.log("Timeout: " + timeoutCount + " timeoutTickPlacement: " + timeoutTickPlacement);
        $progressBar.attr("style", "width:" + timeoutTickPlacement + "%");
        $('<div/>').attr('class','timelineTick timeoutTick').attr('style','left:' + timeoutTickPlacement + '%;').appendTo(timeoutTickContainer);

        // Show the retry tick
        elapsedRetryProgress += delayInMS;
        // Do the math...
        var retryTickPlacement = Math.round((elapsedRetryProgress/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
        //console.log("Timeout: " + timeoutCount + " retryTickPlacement: " + retryTickPlacement);
        $progressBar.attr("style", "width:" + retryTickPlacement + "%");
        $('<div/>').attr('class','timelineTick retryTick').attr('style','left:' + retryTickPlacement + '%;').appendTo(retryTickContainer);

        // Advance the progress bar until the next timeout
        setProgressBar(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar);
    };

    /**
     * Sets the progress in the progress bar timeline, then calls setTicks() to put
     * up the timeout and retry ticks.
     * 
     * @param maxDurationInMS  - Max Duration in milliseconds
     * @param delayInMS        - Delay in milliseconds
     * @param jitterInMS       - Jitter in milliseconds
     * @param timeout          - Timeout value in milliseconds
     * @param timeoutCount     - Running count on how many timeouts have been 
     *                               processed.  Initialized to 0.
     * @param timeoutsToSimulate   - Number of timeouts to simulate.
     * @param elapsedRetryProgress - Running total of the number of milliseconds
     *                                   that have passed on the dashboard.
     * @param currentPctProgress   - Percent completed on dashboard
     * @param timeoutTickContainer - Where to place the timeout ticks
     * @param retryTickContainer   - Where to place the retry ticks
     * @param $progressBar         - JQuery object of the progress bar  
     */
    var setProgressBar = function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar){
        var progress1pct = maxDurationInMS * .01;  // Number Milliseconds in 1% of timeline.
        var moveProgressBar = setInterval( function() {
            // Moves the timeline forward 1% at a time.  If no more timeouts should 
            // be processed it stops and shows the transaction history.
            if (timeoutCount === timeoutsToSimulate) {
                clearInterval(moveProgressBar);
                browser.setURL(__browserTransactionBaseURL);
                browser.setBrowserContent(htmlRootDir + "transaction-history.html");
            } else {
                // Determine how far (% of timeline) we would travel in <timeout> milliseconds.
                var forwardPctProgress = Math.round(((elapsedRetryProgress + timeout)/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
                if (currentPctProgress < forwardPctProgress) {
                    currentPctProgress++;
                    //console.log("extend progress to " + currentPctProgress + "%");
                    if (currentPctProgress <= 100) {
                        $progressBar.attr("style", "width:" + currentPctProgress + "%");
                    } else {
                        // Exceeded maxDuration!  
                        //console.log("maxDuration exceeded....put up error");
                        clearInterval(moveProgressBar);
                        browser.setURL(__browserTransactionBaseURL);
                        // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                        browser.setBrowserContent(htmlRootDir + "transaction-history-timeout-error.html");
                    }
                }  else {
                    clearInterval(moveProgressBar);
                    elapsedRetryProgress += timeout;
                    //console.log("set elapsedRetryProgress up " + timeout + ":" + elapsedRetryProgress);
                    setTicks(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar);
                }   
            }
        }, progress1pct);  // Repeat -- moving the timeline 1% at a time
    };        

    var __populateURL = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
               // Click or 'Enter' or 'Space' key event...
            contentManager.setBrowserURL(stepName, __browserTransactionBaseURL);
        }
    };

    var __listenToBrowserForTransactionHistory = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            if (contentManager.getCurrentInstructionIndex(webBrowser.getStepName()) === 1) {
                // Check if the url is correct before loading content
                if (webBrowser.getURL() === __browserTransactionBaseURL) {
                    webBrowser.setBrowserContent(htmlRootDir + "transaction-history-loading.html");
                    contentManager.markCurrentInstructionComplete(webBrowser.getStepName());
                }                
            }
        }
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var __listenToBrowserForTransactionHistoryAfterRetry = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            var stepName = webBrowser.getStepName();
            var numOfRequest = contentManager.getCurrentInstructionIndex(stepName);
            // Check if the url is correct before loading content
            if (webBrowser.getURL() === __browserTransactionBaseURL) {
                handleTransactionRequestInBrowser(stepName, numOfRequest);
            }                
        }
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var addRetryAnnotationButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
               switch (stepName) {
                    case 'AddRetryOnRetry':
                        __addRetryOnRetryInEditor(stepName);
                        break;
                    case 'AddLimitsRetry':
                        __addLimitsRetryInEditor(stepName);
                        break;
               }
        }
    };

    var __addRetryOnRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 12, 12, newContent, 1);
    };

    var __addLimitsRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries=4,\n           maxDuration=10,\n           durationUnit=ChronoUnit.SECONDS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 13, newContent, 1);
    };

    var listenToEditorForLimitsRetry = function(editor) {
        editor.addSaveListener(__showPodWithDashboardAndBrowser);
    };

    var __showPodWithDashboardAndBrowser = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var paramsToCheck = [];

        if (stepName === "AddLimitsRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                             "maxRetries=4",
                             "maxDuration=10",
                             "durationUnit=ChronoUnit.SECONDS"
                            ];
        }

        if (__checkRetryAnnotationInContent(content, paramsToCheck)) {
            editor.closeEditorErrorBox(stepName);
            contentManager.markCurrentInstructionComplete(stepName);
            contentManager.updateWithNewInstructionNoMarkComplete(stepName);

            var htmlFile;
            if (stepName === "AddLimitsRetry") {
                htmlFile = htmlRootDir + "transaction-history-retry-dashboard.html";
            }

            // Display the pod with dashboard and web browser in it
            contentManager.setPodContent(stepName, htmlFile);
            contentManager.resizeTabbedEditor(stepName);
        } else {
            // display error and provide link to fix it
            editor.createErrorLinkForCallBack(true, __correctEditorError);
        }
    };

    var __checkRetryAnnotationInContent = function(content, parmsToCheck) {
        var annotationIsCorrect = true;
        var editorContentParts = __getEditorParts(content);
        if (editorContentParts.hasOwnProperty("retryParms")) {
            var parmsInAnnotation = __isParmInRetryAnnotation(editorContentParts.retryParms, parmsToCheck);
            if (parmsInAnnotation !== 1) {
                annotationIsCorrect = false;
            }
        } else {
            annotationIsCorrect = false;  // None specified
        }
        return annotationIsCorrect;
    };

    /**
     * Match the parameters in the annotation to those expected and their
     * expected value.
     * 
     * @param  annotationParms - inputted parms array to validate
     *                           Each entry is a string of form
     *                              name = value
     * @param  parmsToCheck - array of expected parameters and their
     *                           expected values.
     * 
     * @returns 0 if the expected parms are not present
     *          1 if there is a match for each expected parm & its value
     *          2 if there are more parms specified than expected
     */
    var __isParmInRetryAnnotation = function(annotationParms, parmsToCheck) {
        var parms = [];     // Array of parm objects { parm, value }
        var allMatch = 1;   // Assume all match

        // For each parameter, pull apart parameter name and its value
        $(annotationParms).each(function(index, element) {
            if (element.indexOf("=") !== -1) {
                parms[index] = {};
                parms[index].name = element.trim().substring(0, element.indexOf('='));
                parms[index].value = element.trim().substring(element.indexOf('=') + 1);
            }
        });

        // Now check that each expected parm (parmsToCheck array) and its
        // value exists in inputted parms.
        $(parmsToCheck).each(function(index, element) {
            var elementMatch = false;
            if (element.indexOf("=") !== -1) {
                // For each expected parameter, pull apart parameter name and its value
                var expectedParm = element.trim().substring(0, element.indexOf('='));
                var expectedValue = element.trim().substring(element.indexOf('=') + 1);

                // Loop through inputted parms to see if expected parm exists
                $(parms).each(function(parmsIndex, parmsElement) {
                    if (parmsElement.name === expectedParm &&
                        parmsElement.value === expectedValue) {
                            elementMatch = true;
                            return false;   // break out of loop
                    }
                });
            } 

            if (elementMatch === false) {
                allMatch = 0;
                return false;   // break out of loop
            }
        });

        if (allMatch === 1 && annotationParms.length > parmsToCheck.length) {
            allMatch = 2 // extra Parameters
        }

        return allMatch;
    };

    /**
     * Parse the content of the editor to pull out the @Retry annotation
     * and its paramters.
     *
     * @param  content - content of the editor
     * 
     * @returns editorContents - object containing 
     *              retryParms - array of strings.  Each string is of form
     *                                 retryparms=value 
     *                           as specified in the content
     *              afterAnnotationContent - copy of content appearing after the
     *                           @Retry annotation
     */
    var __getEditorParts = function(content) {
        var editorContents = {};
        try {
            // match:
            //
            // public class BankService {
            //  < space or newline >
            //     @Retry(...)
            //     @Timeout(2000)
            //     public Service showTransactions()....
            //
            // and capture groups to get content before the annotation,
            // the @Retry annotation, the @Retry annotation params, and
            // content after the annotation.
            //
            // Syntax:
            //  \s to match all whitespace characters
            //  \S to match non whitespace characters
            //  \d to match digits
            //  () capturing group
            //  (?:) noncapturing group
            //
            // Result:
            //   groups[0] - same as content
            //   groups[1] - content before the @Retry annotation
            //   groups[2] - the whole @Retry annotation
            //   groups[3] - the @Retry parameters
            //   groups[4] - content after the @Retry annotation
            var codeToMatch = "([\\s\\S]*public class BankService {\\s*)" +     // Before the @Retry
                              "(@Retry" + "\\s*" + "\\(" + "\\s*" +
                              "((?:\\s*(?:retryOn|maxRetries|maxDuration|durationUnit|delay|delayUit|jitter|jitterDelayUnit|abortOn)\\s*=\\s*[\\d\.,a-zA-Z]*)*)" +
                              "\\s*" + "\\))" +
                              "(\\s*@Timeout\\(2000\\)[\\s\\S]*)";              // After the @Retry
            var regExpToMatch = new RegExp(codeToMatch, "g");
            var groups = regExpToMatch.exec(content);

            var parms = groups[3];   // String of just the @Retry paramters
            parms = parms.replace('\n','');
            parms = parms.replace(/\s/g, '');  // Remove white space
            if (parms.trim() !== "") {
                parms = parms.split(',');
            } else {
                parms = [];
            }

            editorContents.retryParms = parms;
            editorContents.afterAnnotationContent = groups[4];

        } catch (e) {

        }
        return editorContents;
    };

    return {
        listenToEditorForFeatureInServerXML: listenToEditorForFeatureInServerXML,
        addMicroProfileFaultToleranceFeatureButton: addMicroProfileFaultToleranceFeatureButton,
        addMicroProfileFaultToleranceFeature: __addMicroProfileFaultToleranceFeature,
        saveServerXML: __saveServerXML,
        saveServerXMLButton: saveServerXMLButton,
        saveButtonEditor: saveButtonEditor,
        addTimeoutButton: addTimeoutButton,
        clickTransaction: clickTransaction,
        listenToEditorForTimeoutAnnotation: listenToEditorForTimeoutAnnotation,
        listenToBrowserForTransactionHistory: __listenToBrowserForTransactionHistory,
        listenToEditorForRetryAnnotation: listenToEditorForRetryAnnotation,
        listenToEditorForLimitsRetry: listenToEditorForLimitsRetry,
        listenToBrowserForTransactionHistoryAfterRetry: __listenToBrowserForTransactionHistoryAfterRetry,
        populateURL: __populateURL,
        addRetryAnnotationButton: addRetryAnnotationButton
    }
})();
