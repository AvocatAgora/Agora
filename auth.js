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
    },
    newPost: function() {
        if(this.isLogin){
            alert('로그인 완료!');
        } else {
            alert('로그인 후 이용해주세요!');
            window.location = '/login';
        }
    }
}