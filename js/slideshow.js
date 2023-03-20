  var imgArray = [
    'images/fulls/wallhaven2.jpg',
    'images/fulls/wallhaven3.jpg',
    'images/fulls/wallhaven4.jpg'],
    curIndex = 0;
    imgDuration = 5000;

function slideShow() {
    document.getElementById('slider').className += "fadeOut";
    setTimeout(function() {
        document.getElementById('slider').src = imgArray[curIndex];
        document.getElementById('slider').className = "";
    },1000);
    curIndex++;
    if (curIndex == imgArray.length) { curIndex = 0; }
    setTimeout(slideShow, imgDuration);
}
slideShow();