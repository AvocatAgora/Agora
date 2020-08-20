module.exports = {
    isLogin: false,
    isOwner:function(req, res){
        if(req.user){
            this.isLogin = true;
            return true;
        } else {
            this.isLogin = false;
            return false;
        }
    }
}