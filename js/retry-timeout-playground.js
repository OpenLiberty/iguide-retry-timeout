var retryTimeoutPlayground = function() {
    var htmlRootDir = "/guides/draft-iguide-retry-timeout/html/";
    var __browserTransactionBaseURL = "https://global-ebank.openliberty.io/transactions";

    var _playground = function(root, stepName, params) {
        this.root = root;
        this.stepName = stepName;
        this.browser = contentManager.getBrowser(stepName);
        // this.editor = contentManager.getEditor(stepName);
    };

    _playground.prototype = {
        startTimeline: function(stepName, params) {
            this.resetPlayground();
            var retryParams = params.retryParms;

            // Set params, or use default param values
            // TODO: probably handle setting defaults in __getParamsFromEditor
            var maxRetries = parseInt(retryParams.maxRetries) || 3;
            var maxDuration = parseInt(retryParams.maxDuration) || 180000;
            this.setMaxDurationOnTimeline(maxDuration);
            var delay = parseInt(retryParams.delay) || 0;
            var jitter = parseInt(retryParams.jitter) || 200;
            var timeout = parseInt(params.timeoutParms[0]) || 1000;

            var timeoutCount = 0;
            var elapsedRetryProgress = 0;
            var $tickContainers = $('[data-step=\'' + this.stepName + '\']').find('.tickContainer');
            var timeoutTickContainer = $tickContainers[0];
            var retryTickContainer = $tickContainers[1];
            var $progressBar = $('[data-step=\'' + this.stepName + '\']').find('.progressBar').find('div');

            this.browser.setBrowserContent(htmlRootDir + "transaction-history-loading.html");
            this.setProgressBar(maxDuration, delay, jitter, timeout, timeoutCount, maxRetries, elapsedRetryProgress, 0, timeoutTickContainer, retryTickContainer, $progressBar);
        },

        resetPlayground: function() {
            this.browser.setBrowserContent(null);
            clearInterval(this.moveProgressBar);
            //TODO: reset progress bar to 0

            var $tickContainers = $('[data-step=\'' + this.stepName + '\']').find('.tickContainer');
            var timeoutTickContainer = $tickContainers[0];
            var retryTickContainer = $tickContainers[1];

            $(timeoutTickContainer).empty();
            $(retryTickContainer).empty();
        },

        setMaxDurationOnTimeline: function(maxDurationValueInMS) {
            // Convert the inputted MS value to Seconds
            var maxDurationSeconds = Math.round((maxDurationValueInMS/1000) * 10)/10;
            if (maxDurationSeconds === 0) {
                // If the converted value is less than .1s, convert to the 
                // smallest amount of time greater than 0 seconds.
                var convertedToSeconds = maxDurationValueInMS/1000;
                var decimalPoints = 100;
                while (maxDurationSeconds === 0) {
                    maxDurationSeconds = Math.round(convertedToSeconds * decimalPoints)/decimalPoints;
                    decimalPoints = decimalPoints * 10
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
         * @param $progressBar         - JQuery object of the progress bar
         */
        setTicks: function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar) {
            timeoutCount++;

            // Show the timeout tick
            // Do the math...
            var timeoutTickPlacement = Math.round((elapsedRetryProgress/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
            // console.log("Timeout: " + timeoutCount + " timeoutTickPlacement: " + timeoutTickPlacement);
            $progressBar.attr("style", "width:" + timeoutTickPlacement + "%;");

            // Determine label for the timeout tick...convert from ms to seconds and round to 1 decimal place
            var timeoutLabel = (elapsedRetryProgress/1000).toFixed(2) + "s";
            $('<div/>').attr('class','timelineTick timeoutTick').attr('style','left:calc(' + timeoutTickPlacement + '% - 5px);').attr('title', timeoutLabel).appendTo(timeoutTickContainer);
            if (stepName !== 'Playground') {
                $('<div/>', {"class": "timelineLabel timeoutLabel", text: timeoutLabel, style: 'left:calc(' + timeoutTickPlacement + '% - 29px);'}).appendTo(timeoutTickContainer);
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
                //console.log("currentPctProgress: " + currentPctProgress + "  :retryTickPctPlacement: " + retryTickPctPlacement);
                if (currentPctProgress < retryTickPctPlacement) {
                    // Advance blue progress bar until we reach the place where
                    // the retry tick should go.
                    $progressBar.attr("style", "width:" + currentPctProgress + "%;");
                } else {
                    clearInterval(me.moveProgressBar);
                    currentPctProgress = retryTickPctPlacement;
                    //console.log("retry tick placed.  CurrentPctProgress: " + currentPctProgress);

                    // Move the blue progress bar exactly to the retry tick spot
                    $progressBar.attr("style", "width:" + retryTickPctPlacement + "%;");
                    elapsedRetryProgress = retryTickSpot;

                    // Put up the retry tick at its spot...
                    // Determine label for the retry tick...convert from ms to seconds and round to 1 decimal place
                    var retryLabel = (elapsedRetryProgress/1000).toFixed(2) + "s";
                    $('<div/>').attr('class','timelineTick retryTick').attr('style','left:calc(' + retryTickPctPlacement + '% - 5px);').attr('title', retryLabel).appendTo(retryTickContainer);
                    if (stepName !== 'Playground') {
                        $('<div/>', {"class": "timelineLabel retryLabel", text: retryLabel, style: 'left:calc(' + retryTickPctPlacement + '% - 29px);'}).appendTo(retryTickContainer);
                    }

                    // Advance the progress bar until the next timeout
                    me.setProgressBar(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar);
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
         * @param $progressBar         - JQuery object of the progress bar
         */
        setProgressBar: function(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar){
            var progress1pct = maxDurationInMS * .01;  // Number Milliseconds in 1% of timeline.
            var me = this;
            this.moveProgressBar = setInterval( function() {
                // Moves the timeline forward 1% at a time.  If no more timeouts should
                // be processed it stops and shows the transaction history.
                if (timeoutCount === timeoutsToSimulate) {
                    clearInterval(me.moveProgressBar);
                    currentPctProgress += 1; // Advance the progress bar to simulate processing
                    if (currentPctProgress <= 100) {
                        $progressBar.attr("style", "width:" + currentPctProgress + "%;");
                    } else {
                        $progressBar.attr("style", "width:100%;");
                    }
                    this.browser.setURL(__browserTransactionBaseURL);
                    this.browser.setBrowserContent(htmlRootDir + "transaction-history.html");
                } else {
                    // Determine how far (% of timeline) we would travel in <timeout> milliseconds.
                    var forwardPctProgress = Math.round(((elapsedRetryProgress + timeout)/maxDurationInMS) * 1000) / 10;  // Round to 1 decimal place
                    if (currentPctProgress < forwardPctProgress) {
                        currentPctProgress++;
                        // console.log("extend progress to " + currentPctProgress + "%");
                        if (currentPctProgress <= 100) {
                            $progressBar.attr("style", "width:" + currentPctProgress + "%;");
                        } else {
                            // Exceeded maxDuration!
                            // console.log("maxDuration exceeded....put up error");
                            clearInterval(me.moveProgressBar);
                            this.browser.setURL(__browserTransactionBaseURL);
                            // NOTE THAT THAT THIS HTML HAS A DELAY IN IT.  MAY NEED NEW ONE FOR PLAYGROUND.
                            this.browser.setBrowserContent(htmlRootDir + "transaction-history-timeout-error.html");
                        }
                    }  else {
                        clearInterval(me.moveProgressBar);
                        elapsedRetryProgress += timeout;
                        // console.log("set elapsedRetryProgress up " + timeout + ":" + elapsedRetryProgress);
                        me.setTicks(maxDurationInMS, delayInMS, jitterInMS, timeout, timeoutCount, timeoutsToSimulate, elapsedRetryProgress, currentPctProgress, timeoutTickContainer, retryTickContainer, $progressBar);
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