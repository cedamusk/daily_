fun main() {
    println("Simple calculator!")

    while (true){
        println("Enter the first number:")
        val num1= readLine()!!.toDouble()

        println("Enter the Second Number:")
        val num2= readLine()!!.toDouble()

        println("Choose an operation:")
        println("1. Addition")
        println("2. Subtraction")
        println("3. Multiplication")
        println("4. Division")
        println("5. Exit")

        val choice = readLine()!!.toInt()

        when (choice){
            1 -> println("Result: ${num1+num2}")
            2 ->println("Result: ${num1-num2}")
            3 ->println("Result: ${num1*num2}")
            4 ->{
                if (num2==0.0){
                    println("Error: Cannot divide by zero.")
                }else{
                    println("Result: ${num1/num2}")
                }
            }
            5 ->{
                println("Exiting...")
                break
            }
            else -> println("Invalid choice. Please try again")
        }
    }
}