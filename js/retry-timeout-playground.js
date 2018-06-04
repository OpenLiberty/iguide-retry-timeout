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
        startTimeline: function(params) {
            this.resetPlayground();
            this.ranOnce = true;
            var retryParams = params.retryParms;

            // Set params, or use default param values
            this.maxRetries = parseInt(retryParams.maxRetries);
            this.maxDuration = parseInt(retryParams.maxDuration);
            this.setMaxDurationOnTimeline(this.maxDuration);
            this.delay = parseInt(retryParams.delay);
            this.jitter = parseInt(retryParams.jitter);

            this.timeout = parseInt(params.timeoutParms.value);

            // If unlimited max duration, calculate theoretical using other params
            if (this.maxDuration === Number.MAX_SAFE_INTEGER && this.maxRetries !== -1) {
                this.maxDuration = this.calcMaxDuration();
            }

            // maxRetries+1 is for timeoutsToSimulate. workaround to simulate the last timeout
            this.timeoutsToSimulate = this.maxRetries + 1;

            var $tickContainers = $('[data-step=\'' + this.stepName + '\']').find('.tickContainer');
            this.timeoutTickContainer = $tickContainers[0];
            this.retryTickContainer = $tickContainers[1];
            this.progressBar = $('[data-step=\'' + this.stepName + '\']').find('.progressBar').find('div');

            if (!this.browser) {
                this.browser = contentManager.getBrowser(this.stepName);
            }
            this.browser.setBrowserContent(htmlRootDir + "transaction-history-loading.html");
            this.setProgressBar();
        },

        replayPlayground: function() {
            this.resetPlayground();
            if (this.ranOnce) {
                this.browser.setBrowserContent(htmlRootDir + "transaction-history-loading.html");
                this.setProgressBar();
            }
        },

        resetPlayground: function() {
            if (!this.browser) {
                this.browser = contentManager.getBrowser(stepName);
            }
            this.browser.setBrowserContent(null);

            if (!this.editor) {
                this.editor = contentManager.getEditorInstanceFromTabbedEditor(stepName, this.fileName);
            }
            this.editor.closeEditorErrorBox();

            clearInterval(this.moveProgressBar);
            if (this.progressBar) {
                this.resetProgressBar();
            }

            this.timeoutCount = 0;
            this.elapsedRetryProgress = 0;
            this.currentPctProgress = 0;

            $(this.timeoutTickContainer).empty();
            $(this.retryTickContainer).empty();
        },
        
        resetProgressBar: function() {
            this.progressBar.attr("style", "width: 0%;");
        },

        calcMaxDuration: function() {
            return (this.timeoutsToSimulate) * (this.timeout + this.delay + this.jitter);
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
         */
        setTicks: function() {
            this.timeoutCount++;
            // Show the timeout tick
            // Do the math...
            var timeoutTickPctPlacement = Math.round((this.elapsedRetryProgress/this.maxDuration) * 1000) / 10;  // Round to 1 decimal place
            if (this.currentPctProgress < timeoutTickPctPlacement) {
                if (timeoutTickPctPlacement <= 100) {
                    this.progressBar.attr("style", "width:" + timeoutTickPctPlacement + "%;");
                    //console.log("set: " + timeoutTickPctPlacement + " -1");            
                    this.currentPctProgress = timeoutTickPctPlacement;           
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
            var timeoutLabel = (this.elapsedRetryProgress/1000).toFixed(2) + "s";
            var timeoutTickAdjustment = timeoutTickPctPlacement <= 1 ? "%);": "% - 3px);";
            $('<div/>').attr('class','timelineTick timeoutTick').attr('style','left:calc(' + timeoutTickPctPlacement + timeoutTickAdjustment).attr('title', timeoutLabel).appendTo(this.timeoutTickContainer);
            if (stepName !== 'Playground') {
                $('<div/>', {"class": "timelineLabel timeoutLabel", text: timeoutLabel, style: 'left:calc(' + timeoutTickPctPlacement + '% - 29px);'}).appendTo(this.timeoutTickContainer);
            }

            if ((stepName === 'Playground') && (this.timeoutCount === this.timeoutsToSimulate)) {
                clearInterval(this.moveProgressBar);
                this.currentPctProgress += 1; // Advance the progress bar to simulate processing
                if (this.currentPctProgress <= 100) {
                    this.progressBar.attr("style", "width:" + this.currentPctProgress + "%;");
                    //console.log("set: " + currentPctProgress + " -7"); 
                } else {
                    this.progressBar.attr("style", "width:100%;");
                    //console.log("set: 100% -8"); 
                }
                this.browser.setURL(__browserTransactionBaseURL);
                this.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
                return;
            }

            // Show the retry tick
            var retryTickSpot = this.elapsedRetryProgress + this.delay;
            //console.log("retryTickSpot: " + retryTickSpot);
            if (this.jitter > 0 && this.delay > 0) {
                // Have a jitter that determines the next delay time.
                var positiveOrNegative = Math.floor(Math.random() * 10) < 5 ? -1: 1;
                var jitterDelay = Math.floor((Math.random() * this.jitter) + 1) * positiveOrNegative;
                //console.log("jitterDelay: " + jitterDelay);
                retryTickSpot += jitterDelay;
                //console.log("retryTickSpot adjusted for jitter: " + retryTickSpot);
            }
            var retryTickPctPlacement = Math.round((retryTickSpot/this.maxDuration) * 1000) / 10;  // Round to 1 decimal place
            var progress1pct = this.maxDuration * .01;  // Number Milliseconds in 1% of timeline.
            var me = this;
            this.moveProgressBar = setInterval( function() {
                // Advance the blue progress bar 1% at a time until we reach the spot
                // for the retry tick.
                me.currentPctProgress++;
                if (retryTickPctPlacement < 100  &&  (me.currentPctProgress+1) < retryTickPctPlacement) { 
                    me.currentPctProgress++;               
                    if (me.currentPctProgress <= 100) {
                        me.progressBar.attr("style", "width:" + me.currentPctProgress + "%;");
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
                        me.currentPctProgress = retryTickPctPlacement;
        
                        // Move the blue progress bar exactly to the retry tick spot
                        me.progressBar.attr("style", "width:" + retryTickPctPlacement + "%;");
                        //console.log("set: " + retryTickPctPlacement + " -5"); 
                        me.elapsedRetryProgress = retryTickSpot;
        
                        // Put up the retry tick at its spot...
                        // Determine label for the retry tick...convert from ms to seconds and round to 1 decimal place
                        var retryLabel = (me.elapsedRetryProgress/1000).toFixed(2) + "s";
                        //console.log("retry tick placed.  CurrentPctProgress: " + currentPctProgress);
                        var retryTickAdjustment = retryTickPctPlacement <= 1 ? "%);": "% - 3px);";
                        $('<div/>').attr('class','timelineTick retryTick').attr('style','left:calc(' + retryTickPctPlacement + retryTickAdjustment).attr('title', retryLabel).appendTo(me.retryTickContainer);
                        if (stepName !== 'Playground') {
                            $('<div/>', {"class": "timelineLabel retryLabel", text: retryLabel, style: 'left:calc(' + retryTickPctPlacement + '% - 29px);'}).appendTo(me.retryTickContainer);
                        }
                
                        // Advance the progress bar until the next timeout
                        me.setProgressBar();    
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
         */
        setProgressBar: function(){
            var progress1pct = this.maxDuration * .01;  // Number Milliseconds in 1% of timeline.
            var me = this;
            this.moveProgressBar = setInterval( function() {
                // Moves the timeline forward 1% at a time.  If no more timeouts should
                // be processed it stops and shows the transaction history.
                if (me.timeoutCount === me.timeoutsToSimulate) {
                    //TODO: this should finish one more timeout and show failure page
                    clearInterval(me.moveProgressBar);
                    me.currentPctProgress += 1; // Advance the progress bar to simulate processing
                    if (me.currentPctProgress <= 100) {
                        me.progressBar.attr("style", "width:" + me.currentPctProgress + "%;");
                        //console.log("set: " + currentPctProgress + " -7"); 
                    } else {
                        me.progressBar.attr("style", "width:100%;");
                        //console.log("set: 100% -8"); 
                    }
                    me.browser.setURL(__browserTransactionBaseURL);
                    me.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
                } else {
                    // Determine how far (% of timeline) we would travel in <timeout> milliseconds.
                    var forwardPctProgress = Math.round(((me.elapsedRetryProgress + me.timeout)/me.maxDuration) * 1000) / 10;  // Round to 1 decimal place
                    if ((me.currentPctProgress + 1) < forwardPctProgress) {
                        me.currentPctProgress++;
                        if (me.currentPctProgress < 100) {
                            me.progressBar.attr("style", "width:" + me.currentPctProgress + "%;");
                            //console.log("set: " + currentPctProgress + " -9"); 
                        } else {
                            // Exceeded maxDuration!
                            // console.log("maxDuration exceeded....put up message");
                            clearInterval(me.moveProgressBar);
                            me.progressBar.attr("style", "width: 100%;");
                            //console.log("set: " + 100 + " -10");                        
                            me.browser.setURL(__browserTransactionBaseURL);
                            // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                            me.browser.setBrowserContent(htmlRootDir + "playground-timeout-error.html");
                        }
                    }  else {
                        clearInterval(me.moveProgressBar);
                        me.elapsedRetryProgress += me.timeout;
                        // console.log("set elapsedRetryProgress up " + timeout + ":" + elapsedRetryProgress);
                        me.setTicks();
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