module.exports = {
    isOwner:function(req, res){
        if(req.user){
            return true;
        } else {
            return false;
        }
    },

    statusUI:function(req, res){
        var authStatusUI = 'login'
        if(this.isOwner(req, res)){
            console.log(req.user.user_name)
            authStatusUI = `${req.user.user_name}`
        }
        return authStatusUI;
    }
}