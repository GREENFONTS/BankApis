const randomGenerator = (length) => {
        let acctNo = []; let i = 0;
        while (i < length) {
        let num =  Math.floor(Math.random() * 10);
          acctNo.push(num)
        }
        return acctNo.join("")
}

module.exports = randomGenerator;