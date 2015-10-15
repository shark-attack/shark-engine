/**
 * Copied from Node-Google-Text-To-Speech module
 * https://github.com/ashafir20/node-google-text-to-speech
 *
 * Altered to not change output to Base64 String, and since I'm
 * modifying it for my own purposes, I'll make it more directly tied in
 * as a VO creation script
 */

var fs = require('fs');
//var File = require('../../utils/File');
var path = require('path');
var speech = require('windows.media.speechsynthesis');
var nodert_streams = require('nodert-streams');

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} languageLocale = the target locale language (example : en)
 * @param  {String} word = the word to translate to speech
 * @param  {function({'audio' : String, 'message' : String })} callback = function invoked on translate completed with two
 * arguments : audio data as base64 and success true for translated ok and false otherwise
 */
var WindowsNETVOCreation = function(config) {
    var self = this;

    /**
     * c-tor
     */
    this.init = function() {};

    /**
     * create VO
     * @param languageLocale
     * @param words
     * @param callback
     */
    this.create = function(languageLocale, words, outfile, cb) {
        config.log('VOCreation', 'Creating VO: ' + words, { date: new Date(), level: "verbose" });

        var ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">';
        ssml += words;
        ssml += '</speak>';

        var synth = new speech.SpeechSynthesizer();
        synth.synthesizeSsmlToStreamAsync(ssml, function (err, speechStream) {
            // create an input stream wrapper for the WinRT stream
            var st = new nodert_streams.InputStream(speechStream);
            var fileStream = fs.createWriteStream(outfile);
            fileStream.on('close', function () {
                cb();
            });

            st.pipe(fileStream);
        });
    };

    this.init();
};

WindowsNETVOCreation.SPEECHBREAK = '<break time="250ms" />';
WindowsNETVOCreation.OUTPUTFORMAT = 'wav';

exports = module.exports = WindowsNETVOCreation;