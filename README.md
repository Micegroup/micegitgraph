# Mice Git Graph Drawer

Mice Git Graph is an open source js library to draw useful git tree.
Ogni nodo dell'albero rappresenta un merge tra branches del progetto in questione.

![alt text](example.png)

## How to use

Inserisci nel codice HTML

```
<canvas id="gitGraph"></canvas>
```

Utlizzare la funzione:
- public projects 
    ```
     createGitgraph('https://example.com/example1/testExample.git','version')
    ```
- private projects 
    ```
     createGitgraph('https://example.com/example1/testExample.git','version','username','password')
    ```


```
Example:

<button onclick="createGitgraph('https://gitlab.com/dariotelese/testGraph.git', 'v3')">DRAW</button>

```

