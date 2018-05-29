var retryTimeoutPlayground = function() {
    var htmlRootDir = "/guides/draft-iguide-retry-timeout/html/";
    var __browserTransactionBaseURL = "https://global-ebank.openliberty.io/transactions";

    var _playground = function(root, stepName, params) {
        this.fileName = "BankService.java";
        this.root = root;
        this.stepName = stepName;
        this.browser = contentManager.getBrowser(stepName);
        this.editor = contentManager.getEditorInstanceFromTabbedEditor(stepName, this.fileName);
    };

    _playground.prototype = {
        startTimeline: function(stepName, params) {
            this.resetPlayground();
            var retryParams = params.retryParms;

            // Set params, or use default param values
            var maxRetries = parseInt(retryParams.maxRetries);
            var maxDuration = parseInt(retryParams.maxDuration);
            this.setMaxDurationOnTimeline(maxDuration);
            var delay = parseInt(retryParams.delay);
            var jitter = parseInt(retryParams.jitter);
            var timeout = parseInt(params.timeoutParms.value);

            var timeoutCount = 0;
            var elapsedRetryProgress = 0;
            var $tickContainers = $('[data-step=\'' + this.stepName + '\']').find('.tickContainer');
            var timeoutTickContainer = $tickContainers[0];
            var retryTickContainer = $tickContainers[1];
            this.progressBar = $('[data-step=\'' + this.stepName + '\']').find('.progressBar').find('div');

            if (!this.browser) {
                this.browser = contentManager.getBrowser(stepName);
            }
            this.browser.setBrowserContent(htmlRootDir + "transaction-history-loading.html");
            this.setProgressBar(maxDuration, delay, jitter, timeout, timeoutCount, maxRetries, elapsedRetryProgress, 0, timeoutTickContainer, retryTickContainer);
        },

        resetPlayground: function() {
            if (!this.browser) {
                this.browser = contentManager.getBrowser(stepName);
            }
            this.browser.setBrowserContent(null);
            
            clearInterval(this.moveProgressBar);
            if (this.progressBar) {
                this.resetProgressBar();
            }
            this.editor.closeEditorErrorBox();

            var $tickContainers = $('[data-step=\'' + this.stepName + '\']').find('.tickContainer');
            var timeoutTickContainer = $tickContainers[0];
            var retryTickContainer = $tickContainers[1];

            $(timeoutTickContainer).empty();
            $(retryTickContainer).empty();
        },
        
        resetProgressBar: function() {
            this.progressBar.attr("style", "width: 0%;");
        },

        setMaxDurationOnTimeline: function(maxDurationValueInMS) {
            var maxDurationSeconds;
            if (maxDurationValueInMS === Number.MAX_SAFE_INTEGER) {
                maxDurationSeconds = "&infin; ";
            } else {
                // Convert the inputted MS value to Seconds
                maxDurationSeconds = Math.round((maxDurationValueInMS/1000) * 10)/10;
                if (maxDurationSeconds === 0) {
                    // If the converted value is less than .1s, convert to the 
                    // smallest amount of time greater than 0 seconds.
                    var convertedToSeconds = maxDurationValueInMS/1000;
                    var decimalPoints = 100;
                    while (maxDurationSeconds === 0) {
                        maxDurationSeconds = Math.round(convertedToSeconds * decimalPoints)/decimalPoints;
                        decimalPoints = decimalPoints * 10;
                    }
                }
            }
            
            // Add to the timeline in the playground.
            $maxDuration = $('[data-step=\'' + this.stepName + '\']').find('.timelineLegendEnd');
            $maxDuration.html(maxDurationSeconds + "s");
        },

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
         */
        setTicks: function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer) {
            timeoutCount++;
            // Show the timeout tick
            // Do the math...
            var timeoutTickPctPlacement = Math.round((elapsedRetryProgress/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
            if (currentPctProgress < timeoutTickPctPlacement) {
                if (timeoutTickPctPlacement <= 100) {
                    this.progressBar.attr("style", "width:" + timeoutTickPctPlacement + "%;");
                    //console.log("set: " + timeoutTickPctPlacement + " -1");            
                    currentPctProgress = timeoutTickPctPlacement;           
                } else {
                    this.progressBar.attr("style", "width: 100%");
                    //console.log("set: 100 - 2");               browser.setURL(__browserTransactionBaseURL);
                    // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                    this.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
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
            var me = this;
            this.moveProgressBar = setInterval( function() {
                // Advance the blue progress bar 1% at a time until we reach the spot
                // for the retry tick.
                currentPctProgress++;
                if (retryTickPctPlacement < 100  &&  (currentPctProgress+1) < retryTickPctPlacement) { 
                    currentPctProgress++;               
                    if (currentPctProgress <= 100) {
                        me.progressBar.attr("style", "width:" + currentPctProgress + "%;");
                        //console.log("set: " + currentPctProgress + " -3"); 
                    } else {
                        // Exceeded maxDuration!
                        clearInterval(me.moveProgressBar);
                        me.progressBar.attr("style", "width: 100%;");
                        //console.log("set: 100% -4"); 
                        //console.log("maxDuration exceeded....put up error");
                        this.browser.setURL(__browserTransactionBaseURL);
                        // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                        this.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
                    }
                }  else {
                    clearInterval(me.moveProgressBar);
                    if (retryTickPctPlacement <= 100) {
                        currentPctProgress = retryTickPctPlacement;
        
                        // Move the blue progress bar exactly to the retry tick spot
                        me.progressBar.attr("style", "width:" + retryTickPctPlacement + "%;");
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
                        me.setProgressBar(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, browser);    
                    } else {
                        // Hit max duration time limit before initiating a Retry.  Error out.
                        me.progressBar.attr("style", "width: 100%;");
                        //console.log("set: 100% -6"); 
                        //console.log("maxDuration exceeded....put up error");                    browser.setURL(__browserTransactionBaseURL);
                        // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                        this.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
                    }
                }
            }, progress1pct);
        },

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
         */
        setProgressBar: function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer){
            var progress1pct = maxDurationInMS * .01;  // Number Milliseconds in 1% of timeline.
            var me = this;
            this.moveProgressBar = setInterval( function() {
                // Moves the timeline forward 1% at a time.  If no more timeouts should
                // be processed it stops and shows the transaction history.
                if (timeoutCount === timeoutsToSimulate) {
                    //TODO: this should finish one more timeout and show failure page
                    clearInterval(me.moveProgressBar);
                    currentPctProgress += 1; // Advance the progress bar to simulate processing
                    if (currentPctProgress <= 100) {
                        me.progressBar.attr("style", "width:" + currentPctProgress + "%;");
                        //console.log("set: " + currentPctProgress + " -7"); 
                    } else {
                        me.progressBar.attr("style", "width:100%;");
                        //console.log("set: 100% -8"); 
                    }
                    this.browser.setURL(__browserTransactionBaseURL);
                    this.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
                } else {
                    // Determine how far (% of timeline) we would travel in <timeout> milliseconds.
                    var forwardPctProgress = Math.round(((elapsedRetryProgress + timeout)/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
                    if ((currentPctProgress + 1) < forwardPctProgress) {
                        currentPctProgress++;
                        if (currentPctProgress < 100) {
                            me.progressBar.attr("style", "width:" + currentPctProgress + "%;");
                            //console.log("set: " + currentPctProgress + " -9"); 
                        } else {
                            // Exceeded maxDuration!
                            // console.log("maxDuration exceeded....put up message");
                            clearInterval(me.moveProgressBar);
                            me.progressBar.attr("style", "width: 100%;");
                            //console.log("set: " + 100 + " -10");                        
                            this.browser.setURL(__browserTransactionBaseURL);
                            // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                            this.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
                        }
                    }  else {
                        clearInterval(me.moveProgressBar);
                        elapsedRetryProgress += timeout;
                        // console.log("set elapsedRetryProgress up " + timeout + ":" + elapsedRetryProgress);
                        me.setTicks(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer);
                    }
                }
            }, progress1pct);  // Repeat -- moving the timeline 1% at a time
        }
    };

    var create = function(root, stepName, params) {
        return new _playground(root, stepName, params);
    };

    return {
        create: create
    };

}();