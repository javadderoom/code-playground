<template>
  <div class="code-editor">
    <MonacoEditor
      v-model="code"
      language="python"
      theme="vs-dark"
      :options="editorOptions"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
const code = ref(`# Welcome to the Code Playground!
print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`)

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
}

const handleChange = (newCode) => {
  console.log('Code changed:', newCode)
}
</script>
