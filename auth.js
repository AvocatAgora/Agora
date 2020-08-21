module.exports = {
    userId: false,
    isOwner:function(req, res){
        if(req.user){
            return true;
        } else {
            return false;
        }
    }
}

/*
CREATE TABLE posts(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    description TEXT,
    created DATETIME NOT NULL,
    author_id VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (id));
*/