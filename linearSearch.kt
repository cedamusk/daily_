fun linearSearch(arr:IntArray, target:Int): Int {
    for (i in arr.indices){
        if(arr[i]==target){
            return i
        }
    }
    return -1

}

fun main(){
    val numbers= intArrayOf(10, 23, 45, 70, 15)
    val target=70

    val result=linearSearch(numbers, target)

    if (result !=-1){
        println("Element found at index: $result")
    }else{
        println("Elements not found.")
    }
}