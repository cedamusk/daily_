fun main(){
    val numbers= arrayOf(10, 20, 30, 40, 50)

    val element=getElementAtIndex(numbers, 2)
    println("Element at index 2:$element")
}

fun getElementAtIndex(array: Array<Int>, index: Int): Int{
    return array[index]
}