password = "12345"

def add(a, b):
    unused = 5
    if a > 0:
        if b > 0:
            if a > b:
                return a
            else:
                return b
    return a + b