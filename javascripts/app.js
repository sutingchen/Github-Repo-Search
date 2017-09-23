window.Github = Ember.Application.create({
    rootElement: "#github-app"
});


Github.Router.map(function(){

    this.resource("repository", { path: "/repositories/:owner.login/:name" }, function () {
        this.resource("followers");
    });

});


Github.IndexRoute = Ember.Route.extend({
    setupController: function (controller, model) {
        controller.loadRepositories();
    }
});


Github.RepositoryRoute = Ember.Route.extend({
    model: function (params) {
        return Ember.$.getJSON("https://api.github.com/repos/" + params["owner.login"] + "/" + params["name"]);
    }
});


Github.FollowersRoute = Ember.Route.extend({
    model: function () {
        repository = this.modelFor("repository");
        return Ember.$.getJSON(repository.subscribers_url);
    },
    setupController: function(controller, model){

        // I know this is whack...

        this._super(controller, model);

        Ember.run.scheduleOnce('afterRender', function(){

            console.log(model.length);

            $('#watchers-modal').modal('show');
            var address = $('#repo-address').attr('href');
            $("#view-all-watchers").attr('href', address + '/watchers');

            $('.modal-opener').on('click',function(){

                $('#watchers-modal').modal('show');
            })

        });


    }
});


Github.IndexController = Ember.ArrayController.extend({
    loadRepositories: function(){

        var q = this.get("searchTerm");
        var self = this;
        var pageNumber = self.pageNumber;

        if(q && q.length > 0){
            this.clearTable();
            Ember.$.getJSON("https://api.github.com/search/repositories", {q: q, page: pageNumber , per_page: 5})
                .done(function(data){
                    var results = data.items;
                    for(var i = 0 ; i < results.length ; i++ ) {
                        results[i] = _.merge({}, results[i], {row_number: 5 *(pageNumber-1) + (i+1)});
                    }
                    self.set("model", results);

                    var $watcher_icon = $("#watcher-icon");
                    results.length > 0 ? $watcher_icon.attr('data-hidden', 'false') : $watcher_icon.attr('data-hidden', 'hidden');

                })
                .fail(function(error){
                    if(error.status === 403){
                        console.dir(error);
                        alert("API rate limit exceeded. Please try it later.");
                        self.set("model", null);
                    } else{
                        console.dir(error);
                        self.set("model", null);
                    }
                })
        } else {
            this.clearTable();
            this.displayEmptyErrorMessage();
        }
    },
    clearTable: function(){
        $("#result-table > tbody > tr").remove();
        $("#watcher-icon").attr('data-hidden', 'hidden');
    },
    displayEmptyErrorMessage: function(){
        $("#result-table > tbody").append('<tr><td colspan="3"><i id="error-message">Enter a keyword...</i></td><tr>');
    },
    title: function() {
        var q = this.get("searchTerm");
        if (q) {
            return "Searching for " + q;
        }
    }.property("searchTerm"),
    searchTerm: "",
    pageNumber: 1,
    actions: {
        searchForRepository: function () {
            this.pageNumber = 1;
            this.loadRepositories();
        },
        prev: function(){
            if(this.pageNumber > 1){
                this.pageNumber--;
                this.loadRepositories()
            }
        },
        next: function(){
            this.pageNumber++;
            this.loadRepositories();
        }
    }
});




// jQuery custom script

$(document).ready(function(){

    $('#error-message').html('Enter a keyword...');


    // Tooltip

    $('button.btn-clipboard').tooltip({
        trigger: 'click',
        placement: 'bottom'
    });

    function setTooltip(btn, message) {
        $(btn).tooltip('hide')
            .attr('data-original-title', message)
            .tooltip('show');
    }

    function hideTooltip(btn) {
        setTimeout(function() {
            $(btn).tooltip('hide');
        }, 1000);
    }

    // Clipboard

    var clipboard = new Clipboard('button.btn-clipboard');

    clipboard.on('success', function(e) {
        setTooltip(e.trigger, 'Copied!');
        hideTooltip(e.trigger);
    });

    clipboard.on('error', function(e) {
        setTooltip(e.trigger, 'Failed!');
        hideTooltip(e.trigger);
    });

    $('input[type=hidden]').change(function(){
        "use strict";
        alert('changed');
    })

});


