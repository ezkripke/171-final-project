function Walkthrough(id, placeSelector, side, text, buttonText) {
    this.id = id;
    this.selector = ".walkthrough#" + this.id;
    this.buttonSelector = this.selector + " .walkthrough-button";

    this.steps = [];
    this.currentStep = 0;

    let wt = this;

    d3.select("body")
        .append("div")
        .attr("class", "walkthrough")
        .attr("id", wt.id)
        .append("div")
        .attr("class", "walkthrough-button btn btn-primary");

    wt.addStep({
        "placement": [placeSelector, side],
        "text": text,
        "buttonText": buttonText,
        "animate": true,
        "lock": false
    });
    wt.executeStep();
    this.currentStep = 1;
}

Walkthrough.prototype.update = function(args) {
    let placement = args.placement;
    let text = args.text;
    let buttonText = args.buttonText;
    let moveSelector = args.moveTo;
    let lock = args.lock;
    let animate = args.animate;
    let preFunc = args.preFunc;
    let postFunc = args.postFunc;

    let wt = this;

    d3.select(wt.buttonSelector)
        .on("mousedown", null);

    if (moveSelector) {
        wt.moveTo(moveSelector);
    }
    wt.lockScroll(lock);

    let guide = $(wt.selector);

    let update = function() {
        wt.setHTML(text);
        wt.setButtonText(buttonText);
        wt.place.apply(wt, placement);
    };

    let enableButton = function() {
        d3.select(wt.buttonSelector)
            .on("mousedown", function() {
                if (postFunc) {
                    postFunc();
                }
                wt.executeStep();
            });
    };

    if (!animate) {
        if (preFunc) {
            preFunc();
        }
        update();
        enableButton();
    } else {
        guide.animate({"opacity": 0}, null, null, function () {
            if (preFunc) {
                preFunc();
            }
            update();
            guide.animate({"opacity": 1}, null, null, enableButton);
        });
    }
};

Walkthrough.prototype.place = function(selector, side) {
    let offset = $(selector).offset();
    let guide = $(this.selector);

    if (side === "right") {
        guide.css("top", offset.top)
            .css("left", offset.left + this.getWidth(selector) + 20);
    } else {
        guide.css("top", offset.top)
            .css("left", offset.left - this.getWidth(this.selector) - 20);
    }
};

// https://stackoverflow.com/questions/4884839/how-do-i-get-an-element-to-scroll-into-view-using-jquery
Walkthrough.prototype.moveTo = function(selector) {
    let offset = $(selector).offset();
    offset.left -= 20;
    offset.top -= 100;
    $("html, body").animate({
        scrollTop: offset.top,
        scrollLeft: offset.left
    });
};

Walkthrough.prototype.lockScroll = function(lock) {
    if (lock) {
        $("html").css("overflow", "hidden");
    } else {
        $("html").css("overflow", "scroll");
    }
};

Walkthrough.prototype.getWidth = function(selector) {
    let width = $(selector).css("width");
    return +(width.slice(0, width.length - 2));
};

Walkthrough.prototype.setHTML = function(text) {
    d3.select(this.selector + " .walkthrough-text")
        .remove();

    if (text) {
        d3.select(this.buttonSelector)
            .style("margin-top", "20px");
        d3.select(this.selector)
            .insert("div", "*")
            .attr("class", "walkthrough-text")
            .html(text);
    } else {
        d3.select(this.buttonSelector)
            .style("margin-top", "auto");
    }
};

Walkthrough.prototype.setButtonText = function(text) {
    if (text) {
        d3.select(this.buttonSelector)
            .text(text);
    } else {
        d3.select(this.buttonSelector)
            .style("display", "none");
    }
};

Walkthrough.prototype.addStep = function(args) {
    this.steps.push(args);
};

Walkthrough.prototype.executeStep = function() {
    let args = this.steps[this.currentStep];
    this.currentStep = (this.currentStep + 1) % this.steps.length;
    this.update(args);
};