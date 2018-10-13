// All this is doing is inserting the parse API keys into every $.ajax
// request that you make so you don't have to.

// Put your parse application keys here!
$.ajaxPrefilter(function (settings, _, jqXHR) {
  jqXHR.setRequestHeader('X-Parse-Application-Id', '28D19FA3745BA5570D04B4C37461926637EB45FF');
  jqXHR.setRequestHeader('X-Parse-REST-API-Key', 'D89B0AB80513AA4936590C82C75F81E80C2BF4E3');
});
