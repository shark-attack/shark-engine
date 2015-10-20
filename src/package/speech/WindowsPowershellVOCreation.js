/**
 * Copied from Node-Google-Text-To-Speech module
 * https://github.com/ashafir20/node-google-text-to-speech
 *
 * Altered to not change output to Base64 String, and since I'm
 * modifying it for my own purposes, I'll make it more directly tied in
 * as a VO creation script
 */

var fs = require('fs');
var path = require('path');
var spawn = require("child_process").spawn;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} languageLocale = the target locale language (example : en)
 * @param  {String} word = the word to translate to speech
 * @param  {function({'audio' : String, 'message' : String })} callback = function invoked on translate completed with two
 * arguments : audio data as base64 and success true for translated ok and false otherwise
 */
var WindowsPowershellVOCreation = function(config) {
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

        var run = "Add-Type -AssemblyName System.speech\r\n" +
            "$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer\r\n" +
            "$speak.SetOutputToWaveFile('" + outfile + "')\r\n" +
            "$speak.SelectVoice('Microsoft Zira Desktop')\r\n" +
            "$speak.SpeakSsml('" + ssml + "')";

        var proc = spawn("powershell.exe",["-command", "&"+run+""]);
        proc.on('close', function (code) {
            proc.stdin.end();
            cb();
        });

        proc.stdout.on("data",function(data){
            config.log('VOCreation', 'Error: ' + data, { date: new Date(), level: "verbose" });
        });

        proc.stderr.on("data",function(data) {
            config.log('VOCreation', 'Error: ' + data, { date: new Date(), level: "verbose" });
        });


        /*Shell = ps( "Add-Type -AssemblyName System.speech\r\n" +
            "$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer\r\n" +
            "$speak.SetOutputToWaveFile('" + outfile + "')\r\n" +
            "$speak.SpeakSsml('" + ssml + "')");

        Shell.output(function(data){
            console.log(data)
            if (data.indexOf('exited') !== -1) {
                cb();
            }
        });*/
    };

    this.init();
};

WindowsPowershellVOCreation.SPEECHBREAK = '<break time="250ms" />';
WindowsPowershellVOCreation.OUTPUTFORMAT = 'wav';

exports = module.exports = WindowsPowershellVOCreation;