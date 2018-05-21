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
        switch(stepName) {
            case "AddLibertyMPFaultTolerance":
                __addMicroProfileFaultToleranceFeature();
                break;
            case "TimeoutAnnotation":
                __addTimeoutInEditor(stepName);
                break;
            case "AddRetryOnRetry":
                __addRetryOnRetryInEditor(stepName);
                break;
            case "AddLimitsRetry":
                __addLimitsRetryInEditor(stepName);
                break;
            case "AddDelayRetry":
                __addDelayRetryInEditor(stepName);
                break;
            case "AddJitterRetry":
                __addJitterRetryInEditor(stepName);
                break;
            case "AddAbortOnRetry":
                __addAbortOnRetryInEditor(stepName);
                break;
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

    var listenToEditorForInitialRetryAnnotation = function(editor) {
        editor.addSaveListener(__showStartingBrowser);
    };

    var listenToPlayground = function(editor) {
        editor.addSaveListener(updatePlayground);
    };

    var __showStartingBrowser = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);

        var htmlFile;
        if (stepName === "TimeoutAnnotation") {
            htmlFile = htmlRootDir + "transaction-history-timeout.html";
        } else if (stepName === "AddRetryOnRetry"  || stepName === "AddAbortOnRetry") {
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

                if (stepName === "AddAbortOnRetry") {
                    setTimeout(function () {
                        // Use a interval timer to make sure the pod content is rendered 
                        // before accessing the browser within.
                        var waitingForPodContentTimeInterval = setInterval(function () {
                            if (contentManager.getPod(stepName).contentRootElement.length === 1) {
                                clearInterval(waitingForPodContentTimeInterval);
                                var podContents = contentManager.getPod(stepName).contentRootElement;
                                // resizeTabbedEditor resizes a small editor to be the same size
                                // as the pod created.  But, on this page we have an editor that
                                // is larger than the browser in the pod ... and we need to extend
                                // the pod size to match the editor.
                                podContents.find('.wbContent').attr("style", "height: 518px;");
                            } 
                        }, 10);
                    }, 300);
                }
                
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
        } else if (stepName === "AddAbortOnRetry") {
            var paramsToCheck = ["retryOn=TimeoutException.class",
                                 "maxRetries=4",
                                 "maxDuration=10",
                                 "durationUnit=ChronoUnit.SECONDS",
                                 "delay=200",
                                 "delayUnit=ChronoUnit.MILLIS",
                                 "jitter=100",
                                 "jitterDelayUnit=ChronoUnit.MILLIS",
                                 "abortOn=FileNotFoundException.class"
                                ]
            contentIsCorrect = __checkRetryAnnotationInContent(content, paramsToCheck);
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
               handleTransactionRequestInBrowser(stepName, numOfRequest);
        }
    };

    var handleTransactionRequestInBrowser = function(stepName, numOfRequest) {
        var browser = contentManager.getBrowser(stepName);
        var browserContentHTML = htmlRootDir + "global-eBank.html";

        var checkURL = browser.getURL().trim();
        if (checkURL === __browserTransactionBaseURL) {
            if (numOfRequest !== -1) {
                contentManager.markCurrentInstructionComplete(stepName);
            }
            if (stepName === "TransactionHistory") {
                if (numOfRequest === 0) {
                    browserContentHTML = htmlRootDir + "transaction-history.html";
                    contentManager.updateWithNewInstructionNoMarkComplete(stepName);
                } else if (numOfRequest === 1) {
                    browserContentHTML = htmlRootDir + "transaction-history-loading.html";
                }
            } else if (stepName === "AddAbortOnRetry") {
                browserContentHTML = htmlRootDir + "transaction-history-timeout-error.html";   
            } else /** if (stepName === "AddRetryOnRetry" || stepName === "AddLimitsRetry", etc....)**/ {
                browserContentHTML = htmlRootDir + "transaction-history-loading.html";
            }
    
            browser.setBrowserContent(browserContentHTML);
    
            switch(stepName) {
                case "TransactionHistory":
                    showBrowserOverlay(browser, numOfRequest, stepName);
                    break;
                case "AddRetryOnRetry":
                    showTransactionHistory(stepName, browser);
                    break;
                case "AddLimitsRetry":
                    showTransactionHistoryWithDashboard(stepName, browser, 3, 10000 /* 10s */, 0 /* Not set */, 0 /* Not set */);
                    break;
                case "AddDelayRetry":
                    showTransactionHistoryWithDashboard(stepName, browser, 3, 10000 /* 10s */, 200, 0 /* Not set */);
                    break;
                case "AddJitterRetry":
                    showTransactionHistoryWithDashboard(stepName, browser, 3, 10000 /* 10s */, 200, 100);
                    break;
            }    
        } else {
            if (checkURL !== ""){
                browser.setBrowserContent("/guides/draft-iguide-retry-timeout/html/page-not-found.html");
            } else {
                browser.setBrowserContent("");
            }
        }
    };

    var showBrowserOverlay = function(browser, numOfRequest, stepName) {
        if (numOfRequest === 1) {
            setTimeout(function () {
                var overlayText = retryTimeoutMessages["OVERLAY_TEXT"];
                browser.enableBrowserOverlay(overlayText);
            }, 5000);
        }
    }

    var showTransactionHistory = function(stepName, browser) {
        var loadingTimeInterval = setInterval(function() {
            clearInterval(loadingTimeInterval);
//        contentManager.setBrowserURL(stepName, browserURL);
            browser.setURL(__browserTransactionBaseURL);
            browser.setBrowserContent(htmlRootDir + "transaction-history.html");
        }, 3000);  // Timeout is set to 3000 milliseconds = 2000ms timeout + some processing time
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
        $progressBar.attr("style", "width: 0%;");

        setProgressBar(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, 0, timeoutTickContainer, retryTickContainer, $progressBar, browser);
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
     * @param currentPctProgress   - Percent completed on timeline
     * @param timeoutTickContainer - Where to place the timeout ticks
     * @param retryTickContainer   - Where to place the retry ticks
     * @param $progressBar         - JQuery object of the progress bar
     * @param browser              - browser affected
     */
    var setTicks = function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar, browser) {
        timeoutCount++;

        // Show the timeout tick
        // Do the math...
        var timeoutTickPctPlacement = Math.round((elapsedRetryProgress/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
        if (currentPctProgress < timeoutTickPctPlacement) {
            if (timeoutTickPctPlacement <= 100) {
                $progressBar.attr("style", "width:" + timeoutTickPctPlacement + "%;");
                //console.log("set: " + timeoutTickPctPlacement + " -1");            
                currentPctProgress = timeoutTickPctPlacement;           
            } else {
                $progressBar.attr("style", "width: 100%");
                //console.log("set: 100 - 2");               browser.setURL(__browserTransactionBaseURL);
                // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                browser.setBrowserContent(htmlRootDir + "transaction-history-timeout-error.html");
                return;
            }
        }

        // Determine label for the timeout tick...convert from ms to seconds and round to 1 decimal place
        //console.log("Timeout: " + timeoutCount + " timeoutTickPctPlacement: " + timeoutTickPctPlacement);
        var timeoutLabel = (elapsedRetryProgress/1000).toFixed(2) + "s";
        var timeoutTickAdjustment = timeoutTickPctPlacement <= 1 ? "%);": "% - 3px);";
        $('<div/>').attr('class','timelineTick timeoutTick').attr('style','left:calc(' + timeoutTickPctPlacement + timeoutTickAdjustment).attr('title', timeoutLabel).appendTo(timeoutTickContainer);
        if (stepName !== 'Playground') {
            $('<div/>', {"class": "timelineLabel timeoutLabel", text: timeoutLabel, style: 'left:calc(' + timeoutTickPctPlacement + '% - 29px);'}).appendTo(timeoutTickContainer);
        }

        // Show the retry tick
        var retryTickSpot = elapsedRetryProgress + delayInMS;
        //console.log("retryTickSpot: " + retryTickSpot);
        if (jitterInMS > 0 && delayInMS > 0) {
            // Have a jitter that determines the next delay time.
            var positiveOrNegative = Math.floor(Math.random() * 10) < 5 ? -1: 1;
            var jitterDelay = Math.floor((Math.random() * jitterInMS) + 1) * positiveOrNegative;
            //console.log("jitterDelay: " + jitterDelay);
            retryTickSpot += jitterDelay;
            //console.log("retryTickSpot adjusted for jitter: " + retryTickSpot);
        }
        var retryTickPctPlacement = Math.round((retryTickSpot/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
        var progress1pct = maxDurationInMS * .01;  // Number Milliseconds in 1% of timeline.
        var moveProgressBar = setInterval( function() {
            // Advance the blue progress bar 1% at a time until we reach the spot
            // for the retry tick.
            if (retryTickPctPlacement < 100  &&  (currentPctProgress+1) < retryTickPctPlacement) { 
                currentPctProgress++;               
                if (currentPctProgress <= 100) {
                    $progressBar.attr("style", "width:" + currentPctProgress + "%;");
                    //console.log("set: " + currentPctProgress + " -3"); 
                } else {
                    // Exceeded maxDuration!
                    clearInterval(moveProgressBar);
                    $progressBar.attr("style", "width: 100%;");
                    //console.log("set: 100% -4"); 
                    //console.log("maxDuration exceeded....put up error");                    browser.setURL(__browserTransactionBaseURL);
                    // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                    browser.setBrowserContent(htmlRootDir + "transaction-history-timeout-error.html");
                }
            }  else {
                clearInterval(moveProgressBar);
                if (retryTickPctPlacement <= 100) {
                    currentPctProgress = retryTickPctPlacement;
    
                    // Move the blue progress bar exactly to the retry tick spot
                    $progressBar.attr("style", "width:" + retryTickPctPlacement + "%;");
                    //console.log("set: " + retryTickPctPlacement + " -5"); 
                    elapsedRetryProgress = retryTickSpot;
    
                    // Put up the retry tick at its spot...
                    // Determine label for the retry tick...convert from ms to seconds and round to 1 decimal place
                    var retryLabel = (elapsedRetryProgress/1000).toFixed(2) + "s";
                    //console.log("retry tick placed.  CurrentPctProgress: " + currentPctProgress);
                    var retryTickAdjustment = retryTickPctPlacement <= 1 ? "%);": "% - 3px);";
                    $('<div/>').attr('class','timelineTick retryTick').attr('style','left:calc(' + retryTickPctPlacement + retryTickAdjustment).attr('title', retryLabel).appendTo(retryTickContainer);
                    if (stepName !== 'Playground') {
                        $('<div/>', {"class": "timelineLabel retryLabel", text: retryLabel, style: 'left:calc(' + retryTickPctPlacement + '% - 29px);'}).appendTo(retryTickContainer);
                    }
            
                    // Advance the progress bar until the next timeout
                    setProgressBar(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar, browser);    
                } else {
                    // Hit max duration time limit before initiating a Retry.  Error out.
                    $progressBar.attr("style", "width: 100%;");
                    //console.log("set: 100% -6"); 
                    //console.log("maxDuration exceeded....put up error");                    browser.setURL(__browserTransactionBaseURL);
                    // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                    browser.setBrowserContent(htmlRootDir + "transaction-history-timeout-error.html");
                }
            }
        }, progress1pct);
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
     * @param currentPctProgress   - Percent completed on timeline
     * @param timeoutTickContainer - Where to place the timeout ticks
     * @param retryTickContainer   - Where to place the retry ticks
     * @param $progressBar         - JQuery object of the progress bar
     * @param browser              - browser affected
     */
    var setProgressBar = function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar, browser){
        var progress1pct = maxDurationInMS * .01;  // Number Milliseconds in 1% of timeline.
        var moveProgressBar = setInterval( function() {
            // Moves the timeline forward 1% at a time.  If no more timeouts should
            // be processed it stops and shows the transaction history.
            if (timeoutCount === timeoutsToSimulate) {
                clearInterval(moveProgressBar);
                currentPctProgress += 1; // Advance the progress bar to simulate processing
                if (currentPctProgress <= 100) {
                    $progressBar.attr("style", "width:" + currentPctProgress + "%;");
                    //console.log("set: " + currentPctProgress + " -7"); 
                } else {
                    $progressBar.attr("style", "width:100%;");
                    //console.log("set: 100% -8"); 
                }
                browser.setURL(__browserTransactionBaseURL);
                browser.setBrowserContent(htmlRootDir + "transaction-history.html");
            } else {
                // Determine how far (% of timeline) we would travel in <timeout> milliseconds.
                var forwardPctProgress = Math.round(((elapsedRetryProgress + timeout)/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
                if ((currentPctProgress + 1) < forwardPctProgress) {
                    currentPctProgress++;                   
                    if (currentPctProgress < 100) {
                        $progressBar.attr("style", "width:" + currentPctProgress + "%;");
                        //console.log("set: " + currentPctProgress + " -9"); 
                    } else {
                        // Exceeded maxDuration!
                        // console.log("maxDuration exceeded....put up message");
                        clearInterval(moveProgressBar);
                        $progressBar.attr("style", "width: 100%;")
                        //console.log("set: " + 100 + " -10");                        
                        browser.setURL(__browserTransactionBaseURL);
                        // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                        browser.setBrowserContent(htmlRootDir + "transaction-history-timeout-error.html");
                    }
                }  else {
                    clearInterval(moveProgressBar);
                    elapsedRetryProgress += timeout;
                    //console.log("set elapsedRetryProgress up " + timeout + ":" + elapsedRetryProgress);
                    setTicks(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar, browser);
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
            var stepName = webBrowser.getStepName();
            var currentInstructionIndex = contentManager.getCurrentInstructionIndex(stepName);
            // Check if the url is correct before loading content
            if (webBrowser.getURL() === __browserTransactionBaseURL) {
                handleTransactionRequestInBrowser(stepName, currentInstructionIndex);
            }
        }
        webBrowser.addUpdatedURLListener(setBrowserContent);
    };

    var __listenToBrowserForTransactionHistoryAfterRetry = function(webBrowser) {
        var setBrowserContent = function(currentURL) {
            var stepName = webBrowser.getStepName();
            var numOfRequest = contentManager.getCurrentInstructionIndex(stepName);
            handleTransactionRequestInBrowser(stepName, numOfRequest);
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
                    case 'AddDelayRetry':
                        __addDelayRetryInEditor(stepName);
                        break;
                    case 'AddJitterRetry':
                        __addJitterRetryInEditor(stepName);
                        break;
                    case 'AddAbortOnRetry':
                        __addAbortOnRetryInEditor(stepName);
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
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries=4,\n           maxDuration=10,\n           durationUnit = ChronoUnit.SECONDS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 13, newContent, 4);
    };

    var __addDelayRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries=4,\n           maxDuration=10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay=200, delayUnit = ChronoUnit.MILLIS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 16, newContent, 5);
    }

    var __addJitterRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries=4,\n           maxDuration=10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay=200, delayUnit = ChronoUnit.MILLIS,\n           jitter=100,\n           jitterDelayUnit = ChronoUnit.MILLIS)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 13, 17, newContent, 7);
    }

    var __addAbortOnRetryInEditor = function(stepName) {
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "    @Retry(retryOn = TimeoutException.class,\n           maxRetries=4,\n           maxDuration=10,\n           durationUnit = ChronoUnit.SECONDS,\n           delay=200, delayUnit = ChronoUnit.MILLIS,\n           jitter=100,\n           jitterDelayUnit = ChronoUnit.MILLIS,\n           abortOn = FileNotFoundException.class)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 14, 20, newContent, 8);
    }

    var listenToEditorForRetryAnnotation = function(editor) {
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
        } else if (stepName === "AddDelayRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                             "maxRetries=4",
                             "maxDuration=10",
                             "durationUnit=ChronoUnit.SECONDS",
                             "delay=200",
                             "delayUnit=ChronoUnit.MILLIS"
                            ];
        } else if (stepName === "AddJitterRetry") {
            paramsToCheck = ["retryOn=TimeoutException.class",
                             "maxRetries=4",
                             "maxDuration=10",
                             "durationUnit=ChronoUnit.SECONDS",
                             "delay=200",
                             "delayUnit=ChronoUnit.MILLIS",
                             "jitter=100",
                             "jitterDelayUnit=ChronoUnit.MILLIS"
                            ]
        }

        if (__checkRetryAnnotationInContent(content, paramsToCheck)) {
            editor.closeEditorErrorBox(stepName);
            var index = contentManager.getCurrentInstructionIndex();
            if (index === 0) {
                contentManager.markCurrentInstructionComplete(stepName);
                contentManager.updateWithNewInstructionNoMarkComplete(stepName);
    
                // Display the pod with dashboard and web browser in it
                var htmlFile = htmlRootDir + "transaction-history-retry-dashboard.html";
                contentManager.setPodContent(stepName, htmlFile);
                contentManager.resizeTabbedEditor(stepName);
            }
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
                              "((?:\\s*(?:retryOn|maxRetries|maxDuration|durationUnit|delay|delayUnit|jitter|jitterDelayUnit|abortOn)\\s*=\\s*[\\d\.,a-zA-Z]*)*)" +
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

    var createPlayground = function(root, stepName) {
        if(!root.selector){
            root = root.contentRootElement;
        }

        var playground = retryTimeoutPlayground.create(root, stepName);
        contentManager.setPlayground(stepName, playground, 0);
    };

    var updatePlayground = function(editor) {
        var stepName = editor.getStepName();
        var playground = contentManager.getPlayground(stepName);

        var params = __getParamsFromEditor(editor.getEditorContent());
        var paramsValid = __verifyParams(params, editor);
        playground.resetPlayground();

        if (paramsValid) {
            playground.startTimeline(stepName, params);
        } else {
            editor.createCustomErrorMessage("Invalid parameter value");
        }
    };

    var __getParamsFromEditor = function(content) {
        var editorContents = {};
        editorContents.retryParms = {};
        try {
            editorContents.retryParms = __getRetryParams(content);
        } catch (e) { }
        try {
            editorContents.timeoutParms = __getTimeoutParams(content);
        } catch (e) { }

        return editorContents;
    };

    var __getRetryParams = function(content) {
        var retryParms = {};
        // [0] - original content
        // [1] - Retry annotation
        // [2] - retry parameters as a string
        var retryRegexString = "(@Retry" + "\\s*" + "\\(" + "\\s*" +
        "((?:\\s*(?:retryOn|maxRetries|maxDuration|durationUnit|delay|delayUnit|jitter|jitterDelayUnit|abortOn)\\s*=\\s*[-\\d\.,a-zA-Z]*)*)" +
        "\\s*" + "\\))";
        var retryRegex = new RegExp(retryRegexString, "g");
        var retryMatch = retryRegex.exec(content);

        // Turn string of params into array
        var retryParamsString = retryMatch[2];
        retryParams = __parmsToArray(retryParamsString);

        var keyValueRegex = /(.*)=(.*)/;
        var match = null;
        $.each(retryParams, function(i, param) {
            match = keyValueRegex.exec(param);
            switch (match[1]) {
                //TODO: possibly check for number-only for some params
                case "retryOn":
                case "maxRetries":
                case "maxDuration":
                case "delay":
                case "jitter":
                    retryParms[match[1]] = match[2];
                    break;
                default:
                // TODO: unrecognized or unsupported parameter
                // throw editor error message
                    break;
            }
        });
        return retryParms;
    };

    var __getTimeoutParams = function(content) {
        // [0] - original content
        // [1] - Timeout annotation
        // [2] - parameter value inside parentheses
        var timeoutRegexString = "\\s*(@Timeout)\\s*" + 
        "(?:\\(\\s*([\\d]*)\\s*\\))?"; // "(?:(?:unit|value)\\s*=\\s*[\\d\\.,a-zA-Z]+\\s*)*|"

        var timeoutRegex = new RegExp(timeoutRegexString, "g");
        var timeoutMatch = timeoutRegex.exec(content);

        var timeoutParams = timeoutMatch[2] || "1000"; //default 1000 if none defined
        timeoutParams = __parmsToArray(timeoutParams);

        return timeoutParams;
    };

    var __verifyParams = function(params, editor) {
        var retryParms = params.retryParms;
        var paramsValid = true;
        if (retryParms) {
            if (retryParms.maxRetries && (parseInt(retryParms.maxRetries) < -1)) {
                paramsValid = false;
            }
            if (retryParms.maxDuration && (parseInt(retryParms.maxDuration) < 0)) {
                paramsValid = false;
            }
            if (retryParms.delay && (parseInt(retryParms.delay) < 0)) {
                paramsValid = false;
            }
            if (retryParms.jitter && (parseInt(retryParms.jitter) < 0)) {
                paramsValid = false;
            }
        }
        return paramsValid;
    };

    // converts the string of parameters into an array
    var __parmsToArray = function(parms) {
        parms = parms.replace(/\s/g, '');  // Remove white space
        if (parms.trim() !== "") {
            parms = parms.split(',');
        } else {
            parms = [];
        }
        return parms;
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
        listenToEditorForInitialRetryAnnotation: listenToEditorForInitialRetryAnnotation,
        listenToEditorForRetryAnnotation: listenToEditorForRetryAnnotation,
        listenToBrowserForTransactionHistoryAfterRetry: __listenToBrowserForTransactionHistoryAfterRetry,
        listenToPlayground: listenToPlayground,
        populateURL: __populateURL,
        addRetryAnnotationButton: addRetryAnnotationButton,
        createPlayground: createPlayground
    }
})();