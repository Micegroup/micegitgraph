# Mice Git Graph Drawer

Mice Git Graph is an open source js library to draw useful git tree. Each node shows a Merge Request "merged" between project's branches

![alt text](example.png)

## How to use

Insert into HTLM code

```
<canvas id="gitGraph"></canvas>
```

Use this function into HTML code:
- public projects 
    ```
     createGitgraph(url,version)
    ```
    - **url**: base url of project gitLab
    - **version**: version of gitLab's project (v3 or v4) 

- private projects 
    ```
     createGitgraph(url,version,username,password)
    ```
    - **url**: base url of project gitLab
    - **version**: version of gitLab's project (v3 or v4) 
    - **username**: gitLab's username 
    - **password**: gitLab's password 
    
    
Example:

```
<canvas id="gitGraph"></canvas>

<button onclick="createGitgraph('https://example.com/example1/testExample.git', 'v3')">DRAW</button>

```

