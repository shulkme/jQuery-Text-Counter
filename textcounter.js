/*!
* jQuery Text Counter Plugin v0.9.0
* https://github.com/ractoon/jQuery-Text-Counter
*
* Copyright 2014 ractoon
* Released under the MIT license
* updated by shulkme
* updated at 2021-05-15
*/
;(function ($) {
    $.textcounter = function (el, options) {
        var base = this;
        base.$el = $(el);
        base.el = el;
        base.$el.data("textcounter", base);
        base.init = function () {
            base.options = $.extend({}, $.textcounter.defaultOptions, options);
            var $formatted_counter_text = $("<div/>").addClass(base.options.textCountMessageClass).attr("aria-live", "assertive").attr("aria-atomic", "true"),
                $count_overflow_text = $("<div/>").addClass(base.options.countOverflowContainerClass);
            base.hideMessage($count_overflow_text);
            base.$container = $("<" + base.options.countContainerElement + "/>").addClass(base.options.countContainerClass).append($formatted_counter_text).append($count_overflow_text);
            base.$text_counter = base.$container.find("div." + base.options.textCountMessageClass);
            base.$el.after(base.$container);
            base.$el.bind("keyup.textcounter click.textcounter blur.textcounter focus.textcounter change.textcounter paste.textcounter", base.checkLimits).trigger("click.textcounter");
            base.options.init(base.el)
        };
        base.checkLimits = function (e) {
            var $this = base.$el, $countEl = base.$container, $text = $this.val(), textCount = 0, textTotalCount = 0,
                eventTriggered = e.originalEvent === undefined ? false : true;
            if (!$.isEmptyObject($text)) {
                textCount = base.textCount($text)
            }
            if (base.options.max == "auto") {
                var max = base.$el.attr("maxlength");
                if (typeof max !== "undefined" && max !== false) {
                    base.options.max = max
                } else {
                    base.$container.text("error: [maxlength] attribute not set")
                }
            } else if (base.options.max == "autocustom") {
                var max = base.$el.attr(base.options.autoCustomAttr);
                if (typeof max !== "undefined" && max !== false) {
                    base.options.max = max
                } else {
                    base.$container.text("error: [" + base.options.autoCustomAttr + "] attribute not set")
                }
            }
            textTotalCount = base.options.countDown ? base.options.max - textCount : textCount;
            base.setCount(textTotalCount);
            if (base.options.min > 0 && eventTriggered) {
                if (textCount < base.options.min) {
                    base.setErrors("min");
                    base.options.minunder(base.el)
                } else if (textCount >= base.options.min) {
                    base.options.mincount(base.el);
                    base.clearErrors("min")
                }
            }
            if (base.options.max !== -1) {
                if (textCount === base.options.max && base.options.max !== 0) {
                    base.options.maxcount(base.el);
                    base.clearErrors("max")
                } else if (textCount > base.options.max && base.options.max !== 0) {
                    if (base.options.stopInputAtMaximum) {
                        var trimmedString = "";
                        if (base.options.type == "word") {
                            var wordArray = $text.split(/[^\S\n]/g);
                            var i = 0;
                            while (i < wordArray.length) {
                                if (i >= base.options.max) {
                                    break
                                }
                                if (wordArray[i] !== undefined) {
                                    trimmedString += wordArray[i] + " ";
                                    i += 1
                                }
                            }
                        } else {
                            var maxLimit = base.options.twoCharCarriageReturn ? base.options.max - base.twoCharCarriageReturnCount($text) : base.options.max;
                            if (base.options.countSpaces) {
                                trimmedString = $text.substring(0, maxLimit)
                            } else {
                                var charArray = $text.split(""), totalCharacters = charArray.length, charCount = 0,
                                    i = 0;
                                while (charCount < maxLimit && i < totalCharacters) {
                                    if (charArray[i] !== " ") {
                                        charCount += 1
                                    }
                                    trimmedString += charArray[i++]
                                }
                            }
                        }
                        $this.val(trimmedString.trim());
                        textCount = base.textCount($this.val());
                        textTotalCount = base.options.countDown ? base.options.max - textCount : textCount;
                        base.setCount(textTotalCount)
                    } else {
                        base.setErrors("max")
                    }
                } else {
                    base.options.maxunder(base.el);
                    base.clearErrors("max")
                }
            }
            if (base.options.minDisplayCutoff == -1 && base.options.maxDisplayCutoff == -1) {
                base.$container.show()
            } else if (textCount <= base.options.min + base.options.minDisplayCutoff) {
                base.$container.show()
            } else if (base.options.max !== -1 && textCount >= base.options.max - base.options.maxDisplayCutoff) {
                base.$container.show()
            } else {
                base.$container.hide()
            }
        };
        base.textCount = function (text) {
            var textCount = 0;
            if (base.options.type == "word") {
                textCount = base.wordCount(text)
            } else {
                textCount = base.characterCount(text)
            }
            return textCount
        };
        base.wordCount = function (text) {
            return text.trim().replace(/\s+/gi, " ").split(" ").length
        };
        base.characterCount = function (text) {
            var textCount = 0, carriageReturnsCount = 0;
            if (base.options.twoCharCarriageReturn) {
                carriageReturnsCount = base.twoCharCarriageReturnCount(text)
            }
            if (base.options.countSpaces) {
                textCount = text.replace(/[^\S\n|\r|\r\n]/g, " ").length
            } else {
                textCount = text.replace(/\s/g, "").length
            }
            if (base.options.countExtendedCharacters) {
                var extended = text.match(/[^\x00-\xff]/gi);
                if (extended == null) {
                    textCount = text.length
                } else {
                    textCount = text.length + extended.length
                }
            }
            if (base.options.twoCharCarriageReturn) {
                textCount += carriageReturnsCount
            }
            return textCount
        };
        base.twoCharCarriageReturnCount = function (text) {
            var carriageReturns = text.match(/(\r\n|\n|\r)/g), carriageReturnsCount = 0;
            if (carriageReturns !== null) {
                carriageReturnsCount = carriageReturns.length
            }
            return carriageReturnsCount
        };
        base.setCount = function (count) {
            var counterText = base.options.countDown ? base.options.countDownText : base.options.counterText;
            base.$text_counter.html(counterText.replace("%d", '<span class="' + base.options.textCountClass + '">' + count + "</span>").replace("%max", base.options.max).replace("%min", base.options.min))
        };
        base.setErrors = function (type) {
            var $this = base.$el, $countEl = base.$container, errorText = "";
            $this.addClass(base.options.inputErrorClass);
            $countEl.addClass(base.options.counterErrorClass);
            switch (type) {
                case"min":
                    errorText = base.options.minimumErrorText;
                    break;
                case"max":
                    errorText = base.options.maximumErrorText;
                    if (base.options.countOverflow) {
                        base.setOverflowMessage()
                    }
                    break
            }
            if (base.options.displayErrorText) {
                if (!$countEl.children(".error-text-" + type).length) {
                    $countEl.append("<" + base.options.errorTextElement + ' class="error-text error-text-' + type + '">' + errorText + "</" + base.options.errorTextElement + ">")
                }
            }
        };
        base.setOverflowMessage = function () {
            base.hideMessage(base.$container.find("." + base.options.textCountMessageClass));
            base.removeOverflowMessage();
            var overflowText = base.options.countOverflowText.replace("%d", base.textCount(base.$el.val()) - base.options.max).replace("%type", base.options.type + "s");
            var overflowDiv = base.$container.find("." + base.options.countOverflowContainerClass).append(overflowText);
            base.showMessage(overflowDiv)
        }, base.removeOverflowMessage = function () {
            base.$container.find("." + base.options.countOverflowContainerClass).empty()
        }, base.showMessage = function ($selector) {
            $selector.css("display", "inline")
        }, base.hideMessage = function ($selector) {
            $selector.css("display", "none")
        }, base.clearErrors = function (type) {
            var $this = base.$el, $countEl = base.$container;
            $countEl.children(".error-text-" + type).remove();
            if ($countEl.children(".error-text").length == 0) {
                base.removeOverflowMessage();
                base.showMessage(base.$container.find("." + base.options.textCountMessageClass));
                $this.removeClass(base.options.inputErrorClass);
                $countEl.removeClass(base.options.counterErrorClass)
            }
        };
        base.init()
    };
    $.textcounter.defaultOptions = {
        type: "character",
        min: 0,
        max: 200,
        autoCustomAttr: "counterlimit",
        countContainerElement: "div",
        countContainerClass: "text-count-wrapper",
        textCountMessageClass: "text-count-message",
        textCountClass: "text-count",
        inputErrorClass: "error",
        counterErrorClass: "error",
        counterText: "Total Count: %d",
        errorTextElement: "div",
        minimumErrorText: "Minimum not met",
        maximumErrorText: "Maximum exceeded",
        displayErrorText: true,
        stopInputAtMaximum: true,
        countSpaces: false,
        countDown: false,
        countDownText: "Remaining: %d",
        countExtendedCharacters: false,
        twoCharCarriageReturn: false,
        countOverflow: false,
        countOverflowText: "Maximum %type exceeded by %d",
        countOverflowContainerClass: "text-count-overflow-wrapper",
        minDisplayCutoff: -1,
        maxDisplayCutoff: -1,
        maxunder: function (el) {
        },
        minunder: function (el) {
        },
        maxcount: function (el) {
        },
        mincount: function (el) {
        },
        init: function (el) {
        }
    };
    $.fn.textcounter = function (options) {
        return this.each(function () {
            new $.textcounter(this, options)
        })
    }
})(jQuery);